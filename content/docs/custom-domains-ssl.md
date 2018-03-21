---
title: Custom Domains and SSL
name: custom-domains-ssl
description: How to register a custom domain with SSL for your website
---

# Custom Domains and SSL

Once your site is upgraded to the paid plan, you can configure your site to be served on a custom domain. Aerobatic will provision a wildcard SSL certificate for your domain using the [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/). Wildcard certificates cover your apex, aka "naked", domain and all subdomains. This allows you to cover all your [deploy stages](/docs/overview#deploy-stages) using the same certificate, for example:

* `https://www.mydomain.com`
* `https://www--test.mydomain.com`
* `https://www--develop.mydomain.com`

Depending on your DNS provider (more on this below), you can use apex (aka "naked") domains:

* `https://mydomain.com`
* `https://test.mydomain.com`
* `https://develop.mydomain.com`

You can also re-use the same domain + certificate across multiple paid websites:

* `https://www.mydomain.com`
* `https://blog.mydomain.com`

### Registering your domain

Registering a new custom domain with wildcard certificate is done via the CLI. From the root of the website that you want to attach the domain, simply run the following command:

{{<cli "aero domain --name mydomain.com --subdomain www">}}

Or if you want to run your site at the apex (i.e. "naked domain"), then specify "@" as the sub-domain:

{{<cli "aero domain --name mydomain.com --subdomain @">}}

See the [aero domain](/docs/cli#domain) command for more details.

#### Domain ownership validation

The first step after running the `aero domain` command is to validate you are the owner of the domain. This is done by creating a special CNAME record with your DNS provider. Very soon after you request the domain with the command above, an email will be sent to you with the CNAME details. You can also run the `aero domain` command again (without any arguments) which will provide the same info.

The validation record will look something like so:

| Record  | Name                                               | Value                                                   |
| ------- | -------------------------------------------------- | ------------------------------------------------------- |
| `CNAME` | `_3639ac514e785e898d2646601fa951d5.yourdomain.com` | `_fbc6a92e9dedgh546e4b606a613d305.acm-validations.aws.` |

If interested, you can read more about the validation process in the [ACM documentation](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-validate-dns.html).

{{% alert warning %}}
Some domain registrars such as Namecheap do not allow an "\_" character in a CNAME value. In this case you will need to transfer your nameservers over to a different DNS provider. We recommend any of the providers listed in the [apex domains section below](#apex-domains).
{{% /alert %}}

Once domain ownership is validated, the domain provisioning process will commence. This takes roughly 40 minutes to complete. Once complete, you will receive an email from `support@aerobatic.com` with instructions on how to configure the actual DNS records that cause your domain to resolve to the Aerobatic CDN. You can also run the `aero domain` command (with no arguments) to get the latest status.

{{% alert warning %}}
Do **NOT** delete the validation CNAME. It will be re-checked every time the SSL certificate is auto-renewed.
{{% /alert %}}

### DNS Settings

Once your domain is provisioned on the Aerobatic CDN, the next step is to create records with your DNS provider so that your domain resolves to your Aerobatic website. We recommend a single wildcard (aka catch-all) CNAME if your domain provider supports it. That way you only have to configure a single DNS record that covers all website subdomains and staging aliases.

| Record  | Name | Value                             |
| ------- | ---- | --------------------------------- |
| `CNAME` | `*`  | `[your_dns_value].cloudfront.net` |

Any named subdomain CNAMEs that point somewhere other than Aerobatic will take precedence over the wildcard (so the same domain can be used for non-Aerobatic sites). If you prefer not to use a wildcard, or your DNS provider doesn't support it, you can of course create each CNAME separately:

| Record  | Name           | Value                             |
| ------- | -------------- | --------------------------------- |
| `CNAME` | `www`          | `[your_dns_value].cloudfront.net` |
| `CNAME` | `blog`         | `[your_dns_value].cloudfront.net` |
| `CNAME` | `www--staging` | `[your_dns_value].cloudfront.net` |

## Apex domains

The apex or "naked" domain is the root domain, sans any subdomain, i.e. `https://yourdomain.net`. Many prefer this simplified format for their website URLs. As long as your DNS provider supports CNAME-like functionality at the zone apex you can load your Aerobatic websites via their apex URL. Providers generally refer to these as `ALIAS` or `ANAME` records. Here are some of the providers that have an offering:

Domain providers that support one of the flavors of CNAME-like at the apex include:

* [DNS Made Easy - ANAME](https://aerobatic.atlassian.net/wiki/display/AKB/Add+an+ANAME+record+to+your+DNS+provider)
* [DNS Simple - ALIAS](https://support.dnsimple.com/articles/alias-record/)
* [easyDNS - ANAME](https://fusion.easydns.com/index.php?/Knowledgebase/Article/View/190/7/aname-records/)
* [Route53 - ALIAS](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html)
* [NS1 - ALIAS](https://ns1.com/articles/naked-domains-get-sexier-with-ns1-alias-records)
* [Cloudflare](https://support.cloudflare.com/hc/en-us/articles/200169056-Does-CloudFlare-support-CNAME-APEX-at-the-root-)

{{% alert warning %}}
Some providers, such as Namecheap, technically allow you to define a `CNAME` record `@` that will route your apex domain correctly. But be aware, this will **likely break email for your domain**. This is because the `@` record takes precedence over any `MX` mail records.
{{% /alert %}}

We suggest you **ONLY** utilize the apex domain if your DNS provider has special `ALIAS/ANAME` record types specifically intended to handle it. The alternative is a `CNAME` for each website like `www`.

### Apex workarounds

If your DNS provider does not support `ANAME` or `ALIAS` records and it's not possible to switch, then your best bet is to redirect the apex URL to a CNAME like `www`. Below are two possible ways to configure this:

* Many providers let you define a URL redirect record that will redirect the apex to any URL of your choice. In this case you would want to point to `https://www.mydomain.com`.

* Use a service called [ARecord](http://www.arecord.net/) which provides a static IP address to assign to an `A` record. Their service will redirect requests from the apex to `www` sub-domain.

{{% alert warning %}}
These redirect solutions only work for an **http** request, NOT **https**. If a user types "yourdomain.com" into their browser, the above solution will work since the browser defaults to http in the absence of a protocol. But the **ONLY** way to make `https://yourdomain.com` work is to use one of the aforementioned DNS providers that support `ANAME` or `ALIAS` record types.
{{% /alert %}}

### Cloudflare Setup {#cloudflare}

When using Cloudflare in front of your Aerobatic custom domain there are a few considerations to keep in mind:

* You can use the [CNAME flattening](https://support.cloudflare.com/hc/en-us/articles/200169056-CNAME-Flattening-RFC-compliant-support-for-CNAME-at-the-root) feature to make your site available at the apex domain.
* We recommend that you disable the Cloudflare proxy and use the "DNS Only" mode. This is done by clicking the orange cloud next to the DNS record so that it runs into a gray cloud with an arrow over top.

If you do choose to enable the Cloudflare Proxy/CDN functionality, then make sure the following settings are made:

* You **must** set SSL to "Full" to avoid your site getting caught in a redirect loop. [[CloudFlare docs](https://support.cloudflare.com/hc/en-us/articles/200170416-What-do-the-SSL-options-mean-)].
* In order to force CloudFlare to use the HTTP headers set by Aerobatic make sure to set the "Respect Existing Headers" option. [[CloudFlare docs](https://support.cloudflare.com/hc/en-us/articles/200169266-Does-Cloudflare-honor-my-Expires-and-Cache-Control-headers-for-static-content-)]

### Route 53 setup {#route53}

If your current domain provider does not provide `ALIAS/ANAME` record types and you really want to host your site on the apex domain, we recommend transferring your name server records to [Amazon Route 53](https://aws.amazon.com/route53/). Route 53 can has a special relationship with CloudFront which is the CDN that Aerobatic uses to host your custom domain and SSL certificate.

You'll want to create two record sets, an `A` record for your apex domain and a second `CNAME` for your `www` subdomain which will automatically redirect to your apex domain as long as the website subdomain is set to `@` in the Aerobatic hosting settings.

| Name      | Type               | Alias | Alias target or Value                |
| --------- | ------------------ | ----- | ------------------------------------ |
| \<blank\> | `A - IPv4 address` | Yes   | `[domain_dns_value].cloudfront.net.` |
| `www`     | `CNAME`            | No    | `[domain_dns_value].cloudfront.net`  |

**Related links**

* [Values for Alias Resource Record Sets](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-values-alias.html#rrsets-values-alias-alias)
* [Migrating DNS Service for an Existing Domain to Amazon Route 53](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html)

### Apex domains and deploy stages {#apex-domains-deploy-stages}

When using deploy stages for websites whose production URL is at the apex, the stage name becomes a subdomain:

* `https://mydomain.com` <-- production
* `https://staging.mydomain.com`
* `https://test.mydomain.com`

<!-- ## Binding domain to website
Once DNS is setup, it's still necessary to bind the domain + subdomain to a specific Aerobatic website. For an existing website this is done in the *Hosting settings* screen. You can also select a custom domain at the time of creating a new website from a Bitbucket repo. Naturally you can only bind one website to a domain name + subdomain combination. For the apex domain you leave the subdomain blank or enter the special value `@`. -->
