---
title:  Aerobatic expands to Frankfurt region
description: We recently introduced multi-region support for our AWS static hosting platform starting with eu-central-1 in Frankfurt
slug: announcing-frankfurt-region-expansion
comments: true
date: 2016-06-13
tags: aws, frankfurt, multi-region
---

Here at Aerobatic we treat performance seriously and recognize that one of the chief benefits of static sites is fast page load time - no matter where the end user is physically located. We've always served your static assets such as images, JavaScripts, stylesheets, etc. from the CloudFront edge node nearest to your end users. But the parent page request passes through CloudFront to our origin servers in the AWS **us-west-2** data centers in Oregon. Depending on the location of the end user and their internet speed, this can result in a considerable latency penalty.

To address this we've been hard at work building in multi-region capabilities to our core hosting platform. On Sunday June 12, we brought our second AWS region online &mdash; **eu-central-1** in Frankfurt, Germany. Using [Route53 latency based routing](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/routing-policy.html#routing-policy-latency), we direct web page requests to whichever of the two regions will provide the fastest response. You don't have to do anything special to take advantage of this. If you have European visitors to your Aerobatic websites, they are already experiencing 60-80% faster TTFB (time to first byte) than before. In fact immediately upon flipping the switch we saw roughly 40% of traffic hitting **eu-central-1** avoiding the 16,000+ km round trip to Oregon. Danke schön AWS!

## Technical details

In case you're interested, here's some details on how we've structured our AWS infrastructure to take advantage of multiple regions.

We're taking the approach of a single write master that replicates to read-replicas in the other regions. New versions of websites are deployed to **us-west-2** which entails both writing metadata to DynamoDB and uploading the version assets to S3. Using [DynamoDB streams](http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Streams.html), a Lambda function is triggered upon writes to certain tables. The Lambda function in turn makes a web service call to all the other regions informing them that the metadata for a specific website has changed. Each region flushes the old metadata from a local Redis cache and preemptively loads the new metadata. Additionally, the newly uploaded S3 assets are replicated to a bucket in each respective region. The first request for a particular URL in a given region will read from the local S3 bucket and simultaneously pipe the output to the HTTP response and the local Redis cache. Subsequent requests for the same URL are served directly from Redis until a new deployment is made. As a fail-safe, each region can come back to the master in Oregon if replication failed for some reason.

Effectively we are building out our own specialized CDN for serving static websites that provides instant cache invalidation in addition to all the existing capabilities of Aerobatic including [basic auth](/docs/http-basic-authentication), [http proxy](/docs/http-proxy), [redirects](/docs/redirects), [custom error pages](/docs/custom-error-pages), and more.

## Future expansion

The hardest part of architecting distributed systems is going from 1 to 2 geographic locations. Going from 2 to 3, 3 to 4, and so on is just a matter of repeating the setup. In the coming weeks we will be bringing **us-east-1** in Virginia online followed by one of the Asia/Pacific regions. With AWS currently operating in 12 regions, with [more on the way](https://aws.amazon.com/about-aws/global-infrastructure/), we are confident our approach will allow us to reach our goal of consistently fast static websites for all your visitors, no matter where they reside. You're free to focus on building great websites rather than CDN configuration and hosting infrastructure.
