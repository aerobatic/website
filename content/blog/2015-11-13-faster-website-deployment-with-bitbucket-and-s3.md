---
title: Faster website deployment with Bitbucket and AWS S3
description: How to efficiently deal with large files in your website by storing them on S3 and the rest of your site in a git repository.
slug: faster-website-deployment-with-bitbucket-and-s3
comments: true
date: 2015-11-13
tags: Bitbucket, S3, AWS, plugin, 4front
---

For many of our customers, especially digital agencies, their websites often contain lots of high-resolution images, music, or videos. Including those files in their git repository can quickly bloat the repo, making most git operations painfully slow. Similarly, deployments to Aerobatic can take a long time, or, in extreme cases, simply time-out if the repository is extremely large.

At the same time, our customers are often already making use of file storage solutions like [Amazon Web Services (AWS) Simple Storage Service (S3)](https://aws.amazon.com/s3/).

A good solution for these large repos would be to allow developers to reference S3 files in their website without having to physically store those files in their git repository.

An even better solution would be to take those files in S3 and serve them from our global CDN with their own cache value that's separate from the rest of the site's code. That way, your code is being updated instantly when you push to Bitbucket, while assets that change infrequently, such as images on S3, are not having their cache expired with each code deploy.

So, starting today, all websites hosted with Aerobatic can now access files stored in a S3 bucket directly from the browser, using our [open-source](http://4front.io/docs/plugins/s3-proxy/) **s3-proxy** plugin. The plugin will honor any cache headers set in the S3 metadata, or you can configure the plugin to override the cache headers. The origin S3 bucket does *not* need to be configured for web hosting. For example, the screenshots in this blog post are being served from S3.

The rest of this tutorial shows how to store large files in S3 and make use of the Aerobatic s3-proxy in your website. The demo for this tutorial is [hosted on Aerobatic](http://s3-proxy.aerobaticapp.com/) and the companion code is on [Bitbucket](https://bitbucket.org/aerobatic/s3-proxy).

## 1) Create a S3 bucket
Obviously skip this section if you already have a AWS account and are making use of S3. If you don't yet have an AWS account, you can [get one for free](https://aws.amazon.com/free/).

  <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/s3proxy/s3-bucket.png" alt="Screenshot of creating a S3 bucket">

## 2) Transfer files to S3
If this is something you'll be doing a lot of, it might be worthwhile to use a file transfer application like [Transmit](https://panic.com/transmit/) that makes it simple to transfer files between your local machine and S3.

  <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/s3proxy/transmit.png" alt="Screenshot of Transmit file transfer application">

## 3) Reference images in your website

~~~html
<img src="//s3-proxy.aerobaticapp.com/media/img/aerobatic-team.jpg">
~~~

In the src URL, you'll notice the following:

- `//s3-proxy.aerobaticapp.com` - You'll replace this with the name of your Aerobatic hosted website
- `/media` - This is the path that will signal to the s3-proxy that the image is on S3. You can call it anything, but it needs to match the `path` value in your `package.json` file.
- `/img` - This is the sub-folder in my S3 bucket.

## 4) Create a package.json file
In the root of your repository, either create a new package.json file, or add the following block to your existing file.

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "path": "/media",
        "module": "s3-proxy",
        "options": {
          "bucket": "aerobatic",
          "accessKeyId": "$S3_ACCESS_KEY_ID",
          "secretAccessKey": "$S3_SECRET_ACCESS_KEY",
          "overrideCacheControl": "max-age=2592000"
        }
      }
    ]
  }
}
~~~

For a full list of options for the s3-proxy, see the Aerobatic [documentation](/docs#sec11).

Again, it's worthwhile to note that the images that are stored on your S3 bucket are being deployed to our global CDN for faster performance with the `overrideCacheControl` value that you specify - in this case 30 days, or 2592000 seconds.

## 5) Link your repository to Aerobatic
You can skip this step if your website is already deployed with Aerobatic

  <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/s3proxy/link-repo.png" alt="Screenshot of deploying a website to Aerobatic">


## 6) Create environment variables
We have two environment variables that will store our AWS access key and secret.

  <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/s3proxy/env-var.png" alt="Screenshot of creating environment variables in Aerobatic">

## Summary
Our website is now live, with our S3 images being served from the global CDN.

  <a href="http://s3-proxy.aerobaticapp.com/">
  <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/s3proxy/demo-app.png" alt="Screenshot of demo app using the s3 proxy plugin">
  </a>

A couple of extra things to consider:

- **IAM Configuration** - It is recommended that a dedicated IAM user be created in the AWS account where the bucket exists that has the minimum necessary rights. The S3 proxy only needs the `s3:GetObject` permission for the path where the hosted assets reside.
- **S3 as a database** - Another potential use for the S3 proxy is to use S3 as a lightweight and affordable database using something like tab-delimited, xml, or json flat files. Client JavaScript would make AJAX calls to the proxy to pull down datasets into browser memory. This is especially useful for things like d3js visualizations that often rely on a JSON file for data.

More details on the S3 proxy can be found on [4front](http://4front.io/docs/plugins/s3-proxy/), the open-source platform that powers Aerobatic.
