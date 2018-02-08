---
title: Migrating our hosting platform to AWS serverless
description: Walkthrough on how Aerobatic transitioned our static hosting platform from Elastic Beanstalk to Lambda and API Gateway
date: 2018-02-07
slug: migrating-aerobatic-to-api-gateway-and-lambda
---

<img src="/img/serverless.png" style="float: right; width: 200px;" />This post describes how Aerobatic recently overhauled our AWS backend infrastructure running on Elastic Beanstalk and Elasticsearch to API Gateway and Lambda. For most Aerobatic users the important takeaway is that your webpages will download faster as there is a higher probability it will be served directly from the nearest CDN node.

But if you get a kick out of AWS nitty grittiness and all things serverless, let's dig in &mdash; or jump straight to the [pretty diagram](#going-serverless).

### Original Architecture

The Aerobatic static hosting platform run on an all AWS stack. From the inception our Node.js based origin servers ran on an Elastic Beanstalk cluster with auto-scaling. In order to reduce latency, the application runs in two regions: `eu-central-1` and `us-west-2`. All website requests are first routed to the nearest CloudFront node and if a cached response is not availabe at the edge, the request is forwarded on to the nearest origin region.

This architecture has served us well, but does introduce a certain floor cost for bringing a new region online because we need at least 2 load-balanced EC2 servers and an Elasticache server running 24x7 in each region. With a serverless architecture, there is no floor cost as you pay for exactly what you use.

CloudFront has improved markedly over the last few years, one weakness it has compared to some other CDNs is the lack of instant purging of cached objects. When you deploy a new version of your website to Aerobatic, the expectation is that visitors around the world will immediately see the latest changes. For this reason, primary web page requests (excluding images, stylesheets, JavaScripts, etc.) were always forwarded to the nearest origin server. We held a pre-gzipped copy of the file in Elasticache, so the response was pretty snappy, but it would be much better to serve these requests directly from the edge.

The [CloudFront best practices](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/ReplacingObjects.html) suggest that you should use versioned object names to avoid the need to purge in the first place. If the cache key changes when the underlying file changes, then CloudFront will treat it as an entirely different object.

This is exactly what the Aerobatic [asset fingerprinting](/docs/site-optimizer/#asset-fingerprinting) process does. At deploy time, the paths to referenced assets in `.html` files are rewritten with the MD5 hash that uniquely identifies the contents of the referenced file. These responses are sent with a far-future `max-age` header, so they will be cached at the CDN until the file _actually_ changes (not necessarily when the website is next deployed).

```html
<!-- The site optimizer rewrites this: -->
<script src="/js/app.js"></script>

<!-- To this: -->
<script src="/js/app--md5--eijtwk4ltj3lkj359kry.js"></script>
```

This works great for URLs that are embedded in the HTML source, but not for actual page URLs that users navigate to. These need to remain static to avoid breaking links and wreaking SEO havoc in the process. Our ideal solution would allow us to serve a high percentage of webpage requests directly from CloudFront whilst responding with the latest version immediately following a new deployment.

### Going Serverless

Before diving into all the details on how we made the switch, here's a diagram depicting the new state of affairs:

![Aerobatic Serverless Architecture](/img/aerobatic-serverless-architecture.png)

At Aerobatic we're big fans of [Lambda functions](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html). Our deployment process, log ingestion, and various background maintenance tasks all run as Lambda functions. The ability to pay for exactly what you use and not have to worry about load-balancers, instance sizes, over/under capacity, auto-scaling, etc. is a huge leap forward in cloud computing. Serverless mania has emerged as one one of the dominant themes in the industry, and for good reason.

Several years ago now AWS released [API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/welcome.html) which exposed an HTTP endpoint that could be proxied to a Lambda function. At first the integration felt clunky due to the need to define each HTTP method/path endpoint in the gateway layer. Since Aerobatic is hosting customer websites with arbitrary file paths, this wasn't feasible. Fortunately, support was later added for [passthrough proxy resources](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html). Now the full request/response can be passed directly through from the gateway to the backend Lambda.

When passthrough support was initially announced we explored whether API Gateway could replace Elastic Beanstalk. Getting our Node app to run on Lambda was straightforward using the excellent [aws-serverless-express](https://github.com/awslabs/aws-serverless-express). Unfortunately there was one big problem &mdash; in order for the Lambda function sitting behind the gateway to identify which website was being requested, we needed to be able to pass the original `Host` header as sent from the browser all the way down the stack &mdash; **CloudFront** -> **API Gateway** -> **Lambda**. Unfortunately we were not able to find a way to make this work. We needed a way to set a custom `X-Forwarded-Host` header so the actual `Host` could be used to resolve b/t CloudFront and API Gateway.

### Lambda@Edge

Last Fall the Lambda team released an exciting new service called [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html) that lets you run Lamba functions on CloudFront nodes. This was _almost_ exactly what we needed (I'll explain the _almost_ in a moment). You can trigger the Lambda@Edge function at one of four different points in the request/response lifecycle:

* After CloudFront receives a request from a viewer (viewer request)
* Before CloudFront forwards the request to the origin (origin request)
* After CloudFront receives the response from the origin (origin response)
* Before CloudFront forwards the response to the viewer (viewer response)

For our use case the viewer request point is exactly what the doctor ordered. It provides the hook to alter the HTTP headers that are forwarded to the origin and which comprise the unique cache key. It's also possible to programmatically generate HTTP responses directly. Our edge function uses some logic like this to set the `Host` header as the `X-Forwarded-Host`.

```js
exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const { headers } = request;

  const hostname = headers.Host[0].value;
  headers['X-Forwarded-Host'] = [{ 'X-Forwarded-Host', hostname }];

  callback(null, request);
};
```

This solved the issue of getting the original `Host` all the way back to our origin Lambda, but there is still the issue of caching web page responses on CloudFront with instant invalidation upon new deployments. Last November AWS [released several new features](https://aws.amazon.com/about-aws/whats-new/2017/11/lambda-at-edge-now-supports-content-based-dynamic-origin-selection-network-calls-from-viewer-events-and-advanced-response-generation/) for Lambda@Edge including the ability to make network calls from the viewer-request. This was the final piece in the puzzle for us to be able to make the serverless transition.

Our solution entails making a network call to DynamoDB to determine when the website being requested was last updated. That value is then appended as a `X-Aero-Last-Updated` header (which is whitelisted in the CloudFront distribution configuration). We don't actually need this value forwarded to the origin, but it forces CloudFront to incorporate the header value in the object's cache key. So a request for `https://www.somesite.com/about` will be cached on CloudFront with a key that incorporates the `updated` website attribute at the time the page was initially fetched from the origin. When a new version of the site is deployed, the `updated` attribute is updated in DynamoDB. The next time a request comes in for that same URL, a different `X-Aero-Last-Updated` header will result causing CloudFront to treat it as a new object. Invalidation success!

You may be wondering, aren't we negating the perf gains by making a network call to DynamoDB on every webpage request? We mitigate this by maintaining a lightweight in-memory cache (different than the actual CloudFront cache) in our edge function. This holds the mapping of hostnames to `updated` timestamps. The network call to DynamoDB is only made if the mapping is not already cached. There's not an entry in this cache for every unique object, only unique hostnames. So if a website is receiving even a little traffic at a specific edge node, the hit rate is pretty good.

{{% alert tip %}}
**TIP:** The [context parameter](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html) passed to your Lambda handler function contains a `invokedFunctionArn` which can be used to determine the nearest AWS region to the current CloudFront edge location.
{{% /alert %}}

The TTL for these cached mappings is only 30 seconds. So the invalidation of cached pages is more like "near-instant". In the worst case, stale pages will be served up to 30 seconds after a deployment has completed. We felt this was an acceptable trade-off to avoid adding the roundtrip latency of a DynamoDB call on every webpage request.

This flowchart might help it make more sense:

<img src="/img/lambda-edge-flowchart.png" alt="Lambda@Edge Flowchart" width="700" />

### Additional Edge Logic

Appending the `X-Forwarded-Host` and `X-Aero-Last-Updated` headers aren't the only things we do in our edge function. Here's some other logic that we perform in the viewer request:

* Normalize the `Accept` header to one of two values to avoid permutations from negatively impacting our hit rate.
* Generate 404 responses for invalid site names, i.e. `https://missingsite.aerobaticapp.com`
* Perform conditional GET logic so a `304 Not Modified` response can be generated at the edge
* Respond with error code to requests that match certain patterns that are deemed illegal avoiding them from ever reaching the origin.

### Conclusion

We've been server-free for a month onow and it's going great. We're serving far more of our overall traffic directly from CloudFront edge nodes resulting in less latency for visitors to our customer's websites around the world. Doesn't hurt that shutting down those EC2 instances has taken a big bite out of our monthly AWS bill either. Our operations have been simplified and we feel better positioned to focus on delivering new static hosting value to customers while delegating more of the behind the scenes compute management to AWS.
