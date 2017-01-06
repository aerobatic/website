---
title: Custom Domains and SSL
name: custom-domains-ssl
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

~~~bash
[$] aero domain --name mydomain.com
~~~

You'll be sent a validation email from `no-reply@certificates.amazon.com`. Clicking on the approve link in the email both verifies your ownership of the domain and indicates approval for a SSL/TLS certificate to be provisioned. Once you approve the domain provisioning process will being. It takes anywhere from 20-40 minutes for everything to propagate across our worldwide content delivery network.

You can run the `aero domain` command again without any arguments to get a status update. Once provisioning is complete you will receive an email from `support@aerobatic.com` with instructions on how to configure your DNS records so that your domain resolves to your Aerobatic website.

{{% alert warning %}}
**ALERT** Receiving the verification email can sometimes trip people up. See the [troubleshooting section](#troubleshooting) at the bottom of this guide.
{{% /alert %}}

### DNS Settings

Once your domain is provisioned on the Aerobatic CDN, the next step is to create records with your DNS provider so that your domain resolves to your Aerobatic website. We recommend a single wildcard or catch-all CNAME if your domain provider supports it. That way you only have to configure a single DNS record that covers all website subdomains and staging aliases.

| Record | Name | Target |
|---|---|---|
| `CNAME` | `*` | `[your_dns_value].cloudfront.net` |

Any named subdomain CNAMEs that point somewhere other than Aerobatic will take precedence over the wildcard (so the same domain can be used for non-Aerobatic sites). If you prefer not to use a catch-all or your DNS provider doesn't support it, you can of course create each CNAME separately:

| Record | Name | Target |
|---|---|---|
| `CNAME` | `www` | `[your_dns_value].cloudfront.net` |
| `CNAME` | `blog` | `[your_dns_value].cloudfront.net` |
| `CNAME` | `www--staging` | `[your_dns_value].cloudfront.net` |

## Apex domains

The apex or "naked" domain is the root domain sans any subdomain, i.e. `https://yourdomain.net`. Many prefer this simplified format for their website URLs. As long as your DNS provider supports CNAME-like functionality at the zone apex you can load your Aerobatic websites via their apex URL. Providers generally refer to these as `ALIAS` or `ANAME` records. Here are some of the providers that have an offering:

Domain providers that support one of the flavors of CNAME-like at the apex include:

* [DNS Made Easy - ANAME](https://aerobatic.atlassian.net/wiki/display/AKB/Add+an+ANAME+record+to+your+DNS+provider)
* [DNS Simple - ALIAS](https://support.dnsimple.com/articles/alias-record/)
* [easyDNS - ANAME](https://fusion.easydns.com/index.php?/Knowledgebase/Article/View/190/7/aname-records/)
* [Route53 - ALIAS](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-choosing-alias-non-alias.html)
* [NS1 - ALIAS](https://ns1.com/articles/naked-domains-get-sexier-with-ns1-alias-records)
* [Zerigo DNS - ALIAS](https://www.zerigo.com/docs/managed-dns/host_types)
* [Cloudflare](https://support.cloudflare.com/hc/en-us/articles/200169056-Does-CloudFlare-support-CNAME-APEX-at-the-root-)

{{% alert warning %}}
**WARNING:** Some providers, such as Namecheap, technically allow you to define a `CNAME` record `@` that will route your apex domain correctly. But be aware, this will **likely break email for your domain**. This is because the `@` record takes precedence over any `MX` mail records.
{{% /alert %}}

We suggest you **ONLY** utilize the apex domain if your DNS provider has special `ALIAS/ANAME` record types specifically intended to handle it. The alternative is a `CNAME` for each website like `www`.

Most all providers let you define a URL redirect record that will redirect the apex to any URL of your choice. In this case you would want to point to `https://www.mydomain.com`. Note that this will only work when a user browses to the non-SSL URL for your site.

### Route 53 setup {#route53}
If your current domain provider does not provide `ALIAS/ANAME` record types and you really want to host your site on the apex domain, we recommend transferring your name server records to [Amazon Route 53](https://aws.amazon.com/route53/). Route 53 can has a special relationship with CloudFront which is the CDN that Aerobatic uses to host your custom domain and SSL certificate.

You'll want to create two record sets, an `A` record for your apex domain and a second `CNAME` for your `www` subdomain which will automatically redirect to your apex domain as long as the website subdomain is set to `@` in the Aerobatic hosting settings.

| Name  | Type | Alias | Alias target or Value |
| ------------- | --------- | ------------- |
| \<blank\>  | `A - IPv4 address` | Yes | `[domain_dns_value].cloudfront.net.` |
| `www`  | `CNAME` | No | `[domain_dns_value].cloudfront.net` |

**Related links**

* [Values for Alias Resource Record Sets](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/resource-record-sets-values-alias.html#rrsets-values-alias-alias)
* [Migrating DNS Service for an Existing Domain to Amazon Route 53](http://docs.aws.amazon.com/Route53/latest/DeveloperGuide/MigratingDNS.html)

### Apex domains and deploy stages #{apex-domains-deploy-stages}
When using deploy stages for websites whose production URL is at the apex, the stage name becomes a subdomain:

* `https://mydomain.com` <-- production
* `https://staging.mydomain.com`
* `https://test.mydomain.com`

<!-- ## Binding domain to website
Once DNS is setup, it's still necessary to bind the domain + subdomain to a specific Aerobatic website. For an existing website this is done in the *Hosting settings* screen. You can also select a custom domain at the time of creating a new website from a Bitbucket repo. Naturally you can only bind one website to a domain name + subdomain combination. For the apex domain you leave the subdomain blank or enter the special value `@`. -->

## Troubleshooting

**Didn't receive the certificate verification email**

First of all, check your spam folder. The email comes directly from Amazon Web Services. Aerobatic does not send the verification email. Assuming the email isn't in your spam folder, read on.

Aerobatic uses Amazon Certificate Manager to provision auto-renewing wildcard SSL certificates for your custom domain. As part of that process, Amazon sends an email to the email address associated with the WHOIS record on your domain. However, if you are using a WHOIS privacy protection service e.g. WhoisGuard, your email address is obscured from the WHOIS record, and thus Amazon cannot properly route the validation email.

However, Amazon also automatically sends its validation email to common administrative email addresses e.g. (`hostmaster@`, `postmaster@`, `webmaster@`, `administrator@`, `admin@`). So, if you have added privacy protection to your custom domain and you haven't received the validation email, one option would be to create an email address such as `webmaster@mydomain.com` and repeat the validation step outlined in this step by step guide.

More details on Amazon Certificate Manager can be found here:
[ACM Provisioning FAQ](https://aws.amazon.com/certificate-manager/faqs/#provisioning)

If you are unable to set up an administrative email address, read on.

Some DNS providers don't provide email services. In that situation, you might be unable to set up an administrative email address as described above. One alternative is to set up free email forwarding with a service such as [Mailgun](https://www.mailgun.com/).

This guide will walk you through setting up the necessary MX records with your DNS provider: [Mailgun Receiving Email Quickstart](https://documentation.mailgun.com/quickstart-receiving.html#how-to-start-receiving-inbound-email)
