---
title: All Aerobatic sites now HTTP/2 enabled
description: Now your websites hosted on Aerobatic can take full advantage of the performance benefits of HTTP/2.
comments: true
date: 2016-09-16
tags: http2
slug: http2-support-now-live
---

We're happy to announce that all websites hosted on Aerobatic are now [HTTP/2](http://qnimate.com/post-series/http2-complete-tutorial/) enabled! Our CDN provider, AWS CloudFront, recently [announced support](https://aws.amazon.com/about-aws/whats-new/2016/09/amazon-cloudfront-now-supports-http2/), so we've switched over both the shared `*.aerobaticapp.com` domain and all our custom domains. Your websites are right now fully geared to take advantage of the performance improvements offered by the new protocol. Brand new distributions have it enabled by default. Here's a [handy tool](https://tools.keycdn.com/http2-test) that let's you enter a URL and have it verify that HTTP/2 is in effect.

In case you are unfamiliar, HTTP/2 is an upgraded version of the HTTP protocol that can make page loading and rendering much faster. HTTP/2 is fully backwards compatible with HTTP/1.1, so your existing websites will continue to work just fine. However in order to take full advantage of the new protocol, there are web development techniques that you can start utilizing today on your websites running on Aerobatic.

One of the biggest changes is what is known as [multiplexing](http://qnimate.com/what-is-multiplexing-in-http2/). This is what allows the browser to make many simultaneous requests on a single TCP connection. With HTTP/1.1 a performance best-practice was to try and minimize the number of HTTP downloads a page needed to make leading to techniques like CSS image sprites and combining all JavaScript and CSS into single files. But with multiplexing, it's actually more efficient to download many individual files in parallel rather than a smaller number of larger downloads. This [Smashing Magazine article](https://www.smashingmagazine.com/2016/02/getting-ready-for-http2/#how-to-prepare-for-http2-now) describes some of the web development techniques you can start using (or stop using) to do things the H2 way.

All [modern browsers have support](http://caniuse.com/#feat=http2) for the new protocol. Be aware that legacy browsers will downgrade to HTTP/1.1, so performance for HTTP/2 optimized pages could suffer on those browsers.

Oh and and more thing, HTTP/2 only works over HTTPS, but we've got you covered as all [custom domains come with an automatically renewing wildcard certificate](/docs/custom-domains-ssl/).

The future is here! Happy developing.
