---
title: Five Reasons to Host a Static Site with Aerobatic Instead of S3
description: I'm a developer. S3 is almost free. Why would I pay for a static hosting service?
slug: why-static-hosting-instead-of-s3
comments: true
date: "2016-02-29"
tags: s3, static hosting
---

At work, have you ever been in a situation where you're describing an idea and a co-worker says, "Oh, I can put that together in an afternoon." Or, that same co-worker reads of a new *Show HN* project on Hacker News and remarks, "That's so simple, I could build that in a couple of hours!"

In our experience, developers (ourselves included) often have a tendency to underestimate how long things take, and more importantly, to discount the value of their time to $0.

Since starting Aerobatic more than 2 years ago, sometimes when we meet a developer and tell them we've built a static hosting platform, a not entirely uncommon response is, "Oh, I'd never need such a service. I stick all my static sites on S3."

Consider this post a response to that FAQ - "Why would I use a static hosting service when I can use S3 for pennies?" Some of these reasons may or may not be applicable to you, but taken together, they outline why you might consider using a dedicated static hosting provider instead of going the DIY route.

## Top 5 Reasons

1. Cache Invalidation
2. Version History & Rollbacks
3. Continuous Deployment
4. Smart URL routing
5. Plugins

### Cache Invalidation

You've got your site [up on S3](http://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html), and now you want to make a tweak to an image. So, you upload the new image and overwrite the old one. You refresh your browser, but the image on your site is still showing the old version. Why doesn't it show the new one? Perhaps you're also using CloudFront, but still, the site is still showing the old version. You don't want to keep changing the file name each time you make a change like, **myimage-v1.png**. So, now you're now in the business of mucking around with cache invalidation and TTL, having to deal with the reality that when you're in dev mode, you want things to invalidate instantly, but once in production, you want a long TTL so that you get the performance benefit of using a Content Distribution Network (CDN).

Some devs reading this may be thinking, "Sure, but that's just an extra AWS CloudFront call to invalidate my assets that I handle in my build anyway" and while that's true, you still may end up waiting 15 minutes for that to propagate in CloudFront.

With Aerobatic, each commit to your repo results in an entirely new version of your site being deployed automatically. This means that we can set a long max-age for your static assets, and Aerobatic automatically handles pointing users at the new version instantly. You just push your code and never need to worry at all about cache invalidation.

### Version History & Rollbacks

This is not something that S3 and CloudFront provide *out of the box*.

Aerobatic automatically retains the 50 most recent versions of your site, all accessible from their own unique URL. Want to see what your site looked like last month or last year? Just click on an older version and it's right there. Don't like the latest version that you just deployed? That's fine too. With one click, you can point your live production site at a prior version. The out-of-the-box cache header management ensures website visitors will always get the currently deployed version and not a previously cached version.

### Continuous Deployment

As a developer, you're already using a Distributed Version Control System (DVCS) like GitHub or [Bitbucket](\\www.bitbucket.org). A common practice is to create a branch for dev, staging, and production. If you're using S3 and CloudFront, that's a bunch of manual configuration to set up your site with a CI tool and git hooks such that you can get your staging version live for review, merge with your master production branch if everything looks ok, and then deploy a new version of your production site. Certainly not impossible, but again, it takes time, and is this something you want to repeat for every single site that you build?

Contrast this with Aerobatic where the [deploy branch feature](/docs/deployment-management) allows you to configure multiple git branches for continuous deployment. One or zero branches can be specified as “production” and up to 5 additional branches as “staging” instances of your site. Whenever a push is made to one of these staging branches your website is automatically deployed to a URL in the form `https://yourapp--test.aerobaticapp.com` where test is a URL-friendly alias for the branch name. You can also use your own custom domain e.g. `https://staging.mydomain.com`

### Smart URL Routing

The devil is always in the details, and users will do any and all things you can think of, and then some. Or, sometimes, different static site generators have different URL conventions. For example, perhaps your site has an **about** section. Users may enter `/about`, `/about/`, `/about.html`, `/about/index`, or `/about/index.html`.

If you've deployed your site to S3, you're now having to write logic to deal with mapping URLs to `.html` files and redirecting to the “pretty” canonical form of requested URLs.

With Aerobatic, all of that is [handled automatically](/docs/static-http-hosting) for you. Here is how Aerobatic handles some common scenarios with __no__ special configuration on your part:

| Request URL   | Condition | Response | Response Code |
| ------------- | --------- | ------------- | --- |
| `/blog`       | File `/blog.html` exists | Render `/blog.html` | `200` or `304` |
| `/blog.html`  | | Redirect to `/blog`    | `301` |
| `/blog/`      | File `/blog/index.html` exists | Render `/blog/index.html` | `200` or `304` |
| `/blog/`      | File `/blog/index.html` does not exist but `/blog.html` does exist | Redirect to `/blog` | `302` |
| `/blog` | File `/blog.html` does not exist but `/blog/index.html` does exist | Redirect to `/blog/` | `302` |
| `/blog/index` | | Redirect to `/blog/` | `301` |
| `/About-Us` | File `/About-Us.html` does not exist but `/about-us.html` does | Redirect to `/about-us` | `301` |
| `/favicon.ico` | File `/favicon.ico` exists | Render `/favicon.ico` | `200` or `304` |
| `/favicon.ico` | File `/favicon.ico` does not exist | Render Aerobatic default favicon | `200` or `304` |
| `/*` | No condition matches | Render built-in or custom error page | `404` |

### Plugins

Our most commonly used plugin is [password-protect](/docs/plugins/password-protect/) where developers want to password protect a site, or certain directories in the site (or maybe just the staging version of their site). For developers using S3, this isn't an available option. So, perhaps now you're setting up your own Apache web server or trying to integrate a 3rd party service into your site.

With Aerobatic, it's a few lines of JSON, push your code to Bitbucket, and you're done in less than a minute. The same is also true for [custom error pages](/docs/plugins/custom-error-pages/) and [redirects](/docs/plugins/redirect/).

For some developers, their site needs to call an API that's not CORS-enabled. Another common scenario is that they need to call an API but don't want to place the API key and secret in the client-side code. Additionally, perhaps the API response doesn't change that much, in which case, it'd be best to cache the API response, like the author of this [Smashing Magazine tutorial](https://www.smashingmagazine.com/2015/04/creating-web-app-in-foundation-for-apps/) did, using Aerobatic.

For the developer hosting sites with S3 and CloudFront, none of those scenarios are handled out of the box. This is all code that needs to be written and maintained.

## Summary

This post isn't intended to slam S3. In fact, Aerobatic itself proudly uses S3 ([and many other AWS services](/blog/lambda-continuous-deployment)). AWS' Chief Evangelist, [Jeff Barr](https://twitter.com/jeffbarr), even featured us in one of his [podcast episodes](https://aws.amazon.com/blogs/aws/aws-podcasts-aerobatic-aire-prairie-cloud-and-osper/). We're arguably AWS' biggest fans.

However, just as we pay [Papertrail](https://papertrailapp.com/) for their deceptively simple logging service, we'd suggest that if you're a developer building static sites, there's a compelling case to be made that using a dedicated static hosting service like Aerobatic is a smart use of your time. We've been obsessing over the platform and features for more than two years, you benefit from the hundreds of support tickets and enhancement requests submitted by our customers that in turn improved our documentation and the product, and you get awesome customer support, all for the price of a couple of cups of coffee. And to the dev that's still thinking, "I can pay AWS $0.84 per month to host my site instead of giving these guys $10" we'd only add that the first site is on us - you pay zero for one site with your own [wildcard SSL cert](/docs/custom-domains-ssl) hosted on Aerobatic. We're confident enough that you'll like what you see and decide to host more sites with us!
