---
title: Speed boost for password and Auth0 protected websites
description: With our unique CDN edge logic password and auth0 protected sites get a big speed boost
date: 2018-05-21
slug: speed-boost-for-password-auth0-protected-sites
---

One of the unique aspects of Aerobatic is [plugins](/docs/plugins)&mdash; server-side extenders declaredin your `aerobatic.yml` file that enhance the capabilities of static sites. Our most popular plugin is the [password-protect](/docs/plugins/password-protect) plugin. It makes it very simple to take an ordinary static site (frequently a Jekyll site), and put a password login form in front of it with no code changes&mdash;just a few lines of YAML:

```yaml
plugins:
  - name: password-protect
    options:
      password: $SITE_PASSWORD
```

While super easy to implement, password protection incurred a performance penalty over non-password protected sites since every webpage request entailed a round-trip to the origin server in order to validate the auth cookie token. Originally we explicitly set `no-cache` headers on these authenticated responses to prevent them from being cached at the CDN edge nodes where they could be used to respond to requests lacking a valid cookie.

Seeing as how password protected sites have emerged as a primary Aerobatic customer use-case, we really wanted to find a way to eliminate this performance hit and make authenticated page responses **every bit as fast** as non-authenticated ones. We are pleased to announce that this is now the case, both for sites using password protection as well as [Auth0 authentication](/docs/plugins/auth0/).

## How it's done

In order to avoid the origin round-trip, the auth cookie token must be validated at the CDN edge node itself **BEFORE** the CDN is allowed to load any cached response. This requires running custom logic at the edge layer. Our CDN provider [AWS CloudFront](https://aws.amazon.com/cloudfront/) has been steadily releasing enhancements to a product called [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html) that enables the execution of serverless Lambda functions on CloudFront. We've been monitoring the progress of this service since it's initial announcement in 2017 and gradually taking increasing advantage of it's capabilities to move more of our static serving logic to the edge.

Anytime we can serve cached responses from the CDN, it means **faster sites for our customers**. Pushing authentication logic out to the edge was a natural next step in this evolution.

{{% alert tip %}}
Aerobatic founder David Von Lehman had the privilege to participate on an AWS webinar and discuss how Aerobatic is leveraging Lambda@Edge to power edge-delivered authenticated static sites. You can check it out on [YouTube](https://www.youtube.com/watch?v=5m8oFxH_Ryk).
{{% /alert %}}

## Cache headers

After successfully logging in to an Aerobatic authenticated site, you'll now see the following header:

```sh
cache-control: max-age=0, s-maxage=86400
```

The [s-maxage](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control#Expiration) directive overrides the `max-age` directive, but only for shared caches like CDNs. The `max-age` tells the browser to **NOT** cache the response. With this combination, each browser request to an authenticated URL will force a fresh requst to the CDN where the auth token will be validated. If the CDN has a cached instance of the url (that was primed by another valid authenticated request, potentially a different person all together), then the cached response will be delivered. If the CDN does not yet have the response, it is fetched from the origin and cached for the next valid authenticated call.

## Taking advantage

All Aerobatic websites leveraging either the [password-protect](/docs/plugins/password-protect) or [auth0](/docs/plugins/auth0) plugin will automatically load noticably faster starting with your next deployment on or after May 21, 2018. **No code changes required**. The performance improvement should be particularly dramatic in parts of the world furthest from an Aerobatic origin server such as South America, Eastern Asia, and Australia/New Zealand.
