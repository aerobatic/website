---
title: AWS Lambda Powered Continuous Deployment
subtitle: Easy, DevOps free, continuous deployment of static websites and web apps
description: Easy, serverless, continuous deployment of static websites and web apps with AWS Lambda and Bitbucket.
slug: lambda-continuous-deployment
comments: true
date: 2015-10-02
tags: lambda, devops, CD
---

Here at Aerobatic our goal is to make it as easy as possible to deploy your static websites directly from Bitbucket. Just `git push` and moments later your site is live. To power our automated continuous deployment workflow, we've turned to [AWS Lambda](https://aws.amazon.com/lambda/) and Node.js for high performance event-driven background processing without having to manage any infrastructure at all.

Here's a high level diagram depicting the sequence of events:

<img class="screenshot" src="//www.aerobatic.com/media/diagrams/lambda-deploy-diagram.png" style="border: solid 1px #eee; padding: 20px">

1. A push is made to the remote repo on Bitbucket. This could be to the master branch or a dedicated build branch.

2. Bitbucket fires a git hook to the Aerobatic node.js application running on Elastic Beanstalk.

3. The Aerobatic application downloads the latest `tar.gz` source bundle from Bitbucket and uploads it directly to an S3 staging bucket.

4. The new S3 object triggers an event that fires the Lambda deployer function.

5. The Lambda function downloads and decompresses the `tar.gz` bundle and extracts the individual files. Files that are compressible, such as .js and .css, are gzip compressed and uploaded to the final S3 hosting bucket. Non-compressible files, such as `.png` or `.jpg`, do not undergo any additional processing and are written to S3 as-is.

## Taking advantage of streams

Our first attempt at implementing the Lambda function (the logic in step 5) took a simplistic approach of downloading and writing the `tar.gz` bundle to a temp directory, extracting the contents to disk, and finally processing each file individually from the temp directory and uploading back to S3. While this worked, it was slow and the 60 second max timeout (more on that in a bit) would elapse before finishing even a modest sized repo.

Not sure of the specs for the EC2 instances that Lambda runs on, but perhaps they are not equipped with SSD. In my cursory testing, the same tar files seemingly extracted much faster on my MacBook Pro than within a Lambda function.

In order to be able to process larger repos it was necessary to refactor the code to eliminate all disk access and work exclusively with streams, which also avoids the creation of large memory buffers. Fortunately this is an area where node really excels.

Here's a diagram that depicts the piping sequence that gets the individual static assets to their final S3 hosting location:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/lambda-post/lambda-pipes.png" style="border: solid 1px #eee; padding: 20px">

1. Invoke the [`getObject`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property) operation from the [Node.js AWS SDK](https://aws.amazon.com/sdk-for-node-js/). What isn't necessarily obvious from the documentation is that you can operate at the stream level rather than pass callbacks. By omitting the second `callback` parameter from the `getObject` function, you will be returned an [`AWS.Request`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html) object which exposes a [`createReadStream`] (http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Request.html#createReadStream-property) operation.

~~~js
var stream = new AWS.S3().getObject({Bucket: bucket, Key: key}).createReadStream();
~~~

2. Next pipe the `readStream` into a [`zlib.Gunzip`](https://nodejs.org/api/zlib.html#zlib_class_zlib_gunzip) object created with the [`createGunzip`](https://nodejs.org/api/zlib.html#zlib_zlib_creategunzip_options) function to decompress the source archive.

~~~js
stream = stream.pipe(zlib.createGunzip());
~~~

3. Pipe the decompressed tar file through the [node tar](https://www.npmjs.com/package/tar) module using the [`Parse`](https://www.npmjs.com/package/tar#tar-parse) function which emits an 'entry' event for each file parsed.

~~~js
var parser = require('tar').Parser;
parser.on('entry', function() {
  // process the file asynchronously
});
stream.pipe(parser);
~~~

As an aside, we originally tried to work with `zip` files rather than `tar.gz`. While there are a number of packages for decompressing and parsing zip files, we kept encountering cryptic errors and inconsistent behavior. The tar package, however, has proven extremely reliable, which shouldn't come as a surprise considering npm itself depends upon it.

4. In parallel, process each extracted file. If the file type is one amenable to compression, pipe it through the return of [`zlib.createGzip()`](https://nodejs.org/api/zlib.html#zlib_zlib_creategzip_options).

~~~js
entry = entry.pipe(zlib.createGzip());
~~~

5. Finally invoke the [`upload`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property) operation to write the file stream to its final destination.

~~~js
new AWS.S3().upload({
  Bucket: '',
  Key: '',
  Body: entry, // Can accept a readStream here
  ContentEncoding: 'gzip' // If step 4 was taken on file
}, callback);
~~~

## Lessons Learned

The Aerobatic Lambda powered continuous deployment engine is up and working well now. One thing I'm really impressed with is how fast Lambda functions fire upon the trigger event, it's nearly instantaneous. In fact, steps 1-4 in the first sequence diagram all generally complete in less than 5 seconds. Bitbucket also deserves credit for the speed at which their git hooks fire upon a successful push.

The net effect is new versions of your apps are live on the web somewhere between 10 and 90 seconds (depending on the size of your repo) following a `git push`. Compared to a service like Heroku, that's pretty blazing fast. Go ahead and [install our Bitbucket add-on](https://bitbucket.org/account/addon-directory/) and try for yourself.

### Dealing with 60 second timeout
Our biggest obstacle, and one we continue to face today, is the 60 second max timeout imposed by AWS on Lambda function execution. While the streaming optimizations certainly helped, the max repo size we can currently support is around 25MB. While this is sufficient for the majority of sites we see deployed on Aerobatic, there are many repos containing things like galleries of high res jpg images that can easily inflate the repo size beyond that.

The worst thing about the timeout is that Lambda aborts your function without warning right at the 60 second cutoff. In order to at least fail more gracefully, we took the approach of setting a JavaScript timer to fire after 58 seconds. That gives us just enough time to shut off the pipeline and mark the deployment in DynamoDB with a "timed out" status. At least that way we can give customers feedback on why their deployment didn't complete.

The good news is that we've heard the Lambda timeout will be increasing to 5 minutes, hopefully to be announced in a few days at the [re:Invent conference](https://reinvent.awsevents.com/). If that comes to fruition (please AWS make it so), it will be a huge win for us and for the entire Lambda ecosystem. With 5x the processing time we should be able to handle the vast majority of the websites our customers want to host on Aerobatic.

### Debugging and Logging
Another challenging aspect of Lambda development is debugging under real world conditions. We unit test our Node code extensively with [mocha](https://mochajs.org/), but it's always difficult to account for everything that can go wrong. It's critical to have robust logging in place that provides enough context to piece together what's happening in production. Lambda does send stdout to CloudWatch which is ok for isolated testing, but because the logs aren't searchable, quickly becomes unwieldy when troubleshooting a Lambda function receiving any sort of load.

Our solution is to send log events from the Lambda function to a 3rd party logging service. We use [Papertrail](http://papertrailapp.com) and highly recommend it. The [winston-papertrail](https://github.com/kenperkins/winston-papertrail) module provides a [winston](https://github.com/winstonjs/winston) transport that handles forwarding log entries to Papertrail. The configuration looks something like so:

~~~js
var winston = require('winston');
require('winston-papertrail').Papertrail;

var logger = new winston.Logger({
  transports: [
    new winston.transports.Papertrail({
      level: 'info',
      hostname: 'LAMBDA_NAME',
      host: 'logs2.papertrailapp.com',
      port: 57510
    })
  ]
});
~~~

Once events are being sent from your Lambda function to Papertrail, you have the ability to do full text searches of your log entries. You can also set up saved searches which can be emailed (or even posted to Slack or HipChat) when new matching entries arrive in the logs. There were a few challenging bugs we were able to pinpoint by logging to Papertrail that we may never have caught otherwise.

### Lambda function deployment
The process of deploying a Lambda function entails creating a zip file (containing your JavaScript code as well as the `node_modules` directory) and uploading it via the [`updateFunction`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Lambda.html#updateFunctionCode-property) operation in the SDK. However to make things easier, this is conveniently encapsulated in the [node-aws-lambda](https://www.npmjs.com/package/node-aws-lambda) npm module which we utilize from a gulpfile. One small optimization you can make to reduce the size of the zip bundle is to delete the `aws-sdk` directory from `node_modules` since it is already installed globally on the Lambda EC2 instances. Our complete gulpfile is available [here](https://bitbucket.org/snippets/aerobatic/xLpab) for reference.

## Alternative Solutions

Other CI/CD services, such as [Codeship](https://codeship.com) (which Aerobatic is a happy customer of) make use of Linux containers to run builds. This makes sense for situations where the build process needs to run arbitrary code provided by the customer and where run times could be lengthy (such as running an extensive test suite against a headless browser). But since we are deploying static files and the deployment logic is all under our control, Lambda provides the isolation benefits of containers, but without the complexity of orchestration, lifetime management, instance sizing, and so on.

It is possible to utilize a CI service in conjunction with Aerobatic by configuring the CI build to `git push` to a special deploy branch of your Bitbucket repo. This would then in turn trigger the Aerobatic deployment process detailed at the start of this post.

## Conclusion
We are definitely bullish on Lambda and look forward to leveraging it further to expand the Aerobatic hosting capabilities. One enhancement under consideration is to follow the model of GitHub Pages and generate your Jekyll sites automatically within Lambda so you don't need to commit your `_site` directory to Bitbucket.

The mission of higher level services that abstract away more and more non-differentiating DevOps tasks is very much inline with our philosophy at Aerobatic. We want to provide a secure, fast, and friction-less delivery system for your websites and web apps so you can focus on building great content and user experiences, not mucking about with servers and shell scripts.
