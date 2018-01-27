---
title: Custom domains with automatic wildcard SSL/TLS
description: Register your own domain with Aerobatic and get an automatic self-renewing wildcard certificate at no extra charge.
slug: announcing-custom-domains-wildcard-ssl
comments: true
date: 2016-02-10
tags: ssl, tls, custom domain, cname, apex, dns, wildcard
---

Just in time for Valentine's Day, we have a special gift for our customers. All custom domains on Aerobatic now come with a wildcard SSL/TLS certificate **automatically**. Now there's no reason why all your websites shouldn't have that pretty little green padlock. And best of all, no crazy OpenSSL incantations to recite, no stressing over expirations. Oh yeah, did I mention these certs auto-renew? What's not to love??

<img src="//www.aerobatic.com/media/blog/--1/padlock-yourdomain-com.png" alt="SSL on your domain" style="max-width: 100%;">

Because these are wildcard certificates, a single cert covers your apex (aka "naked") domain and any subdomain. This allows you to run multiple Aerobatic websites off the same certificate, each on their own subdomain:

* `https://www.mydomain.com`
* `https://blog.mydomain.com`
* `https://intranet.mydomain.com`

Wildcards also play nicely with [staging branches](/docs/deployment-management) where the branch alias is embedded into the subdomain:

* `https://www--staging.mydomain.com`
* `https://blog--test.mydomain.com`

## Getting started

See the [Custom Domains/SSL docs](/docs/custom-domain-ssl).

## DNS records

When the provisioning process is complete your domain will be assigned a target domain name like `abcd1234.cloudfront.net`. You can setup individual CNAME records for each website, i.e. `www`, `blog`, etc. Or better yet, create a single catch-all wildcard record `*` that will resolve any subdomain without an explicit match to your Aerobatic CDN domain. That way you can create new websites without having to go back in to your DNS provider to create corresponding CNAMEs.

## Naked domains

It's become trendy of late to drop the subdomain entirely and go "naked". Twitter, for example, lives at just plain `https://twitter.com`. You can do the same for your website on Aerobatic if your DNS provider supports one of the special DNS record types that allow you to define CNAME-like records at the apex of your domain. Many of the top DNS services offer such functionality including DNSimple, DNS Made Easy, easyDNS, Namecheap, and Route 53. See more details in the [custom domains documentation](/docs/custom-domains-ssl).

If you do take the naked route for your production URL, then your staging aliases become full-fledged subdomains like so:

* `https://mydomain.com` --production
* `https://staging.mydomain.com`
* `https://preview.mydomain.com`
* `https://test.mydomain.com`
