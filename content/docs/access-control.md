---
title: Access Control
name: access-control
description: Access control features of Aerobatic
---

# Access Control

<img src="/img/access-control-icon.png" style="float:right">

Not all websites are intended to be accessible to the general public. Aerobatic specializes in providing you a choice of robust solutions for locking down your site to authorized users only.

- [Password protect plugin](/docs/plugins/password-protect) - Simple password that you distribute to people that need access.
- [Auth0 Plugin](/docs/plugins/auth0) - Full featured identity management that allows signups and individual user accounts powered by [Auth0](https://auth0.com).
- [Client IP ranges](#client-ip-ranges) - Make your website accessible only to clients coming from specific IP ranges

### Client IP Ranges

You can lock your website down so that it is only accessible to specific IP ranges. Ranges can be set as one or more IPs or [CIDR blocks](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing). IPv6, IPv4, and IPv4-mapped over IPv6 addresses are all supported. There are numerous online IP converters that will provide CIDR values given an IP range.

- [IPv4 Range To CIDR converter](https://www.ipaddressguide.com/cidr)
- [IPv6 Range To CIDR converter](https://www.ipaddressguide.com/ipv6-cidr)

  The IP range is set using the CLI [clientip](/docs/cli/#clientip) command. For example, say you want to restrict access to clients with IPs between `97.113.60.20` and `97.113.60.40`. Input those values into the converter above, and the following CIDR values are returned: `97.113.60.20/30`, `97.113.60.24/29`,`97.113.60.32/28`, `97.113.60.40/32`. Then use the following CLI command to set the ranges:

{{<cli "aero clientip --value \"97.113.60.20/30,97.113.60.24/29,97.113.60.32/29,97.113.60.40/32\"">}}

Using this command you can change the ranges, or remove the IP restrictions at any time without having to re-deploy your site. It takes at most 30 seconds from the time you issue to the command to when it starts to take effect.

To remove all IP restrictions, you can use the following command:

{{<cli "aero clientip --delete">}}

#### 403 Error Page

Visitors whose IP address falls outside the specified ranges will receive an HTTP `403` error page that looks like so:

<img src="https://www.aerobatic.com/media/docs/--1/blocked-client-ip.png" style="border:solid 1px silver; width:600px;">

**Custom error page**

With the [custom-errors](/docs/plugins/custom-errors) plugin you can build your own custom `403` error page to display instead.

```yaml
plugins:
  - name: custom-errors
    options:
      errors:
        403: 403.html
```

#### Stage specific restrictions

You can also use IP ranges to restrict access to only specific [deploy stages](/deployment/#deploy-stages). This is a great solution for limiting access to the test instance of your site even when the production URL is wide open to the public. That way you don't have to worry about anyone randomly stumbling across your test site. Simply append the `--stage` option to the CLI command:

{{<cli "aero clientip --value '97.113.60.20/30' --stage test">}}

{{% alert tip %}}
**TIP:** Unlike the [password-protect](/docs/plugins/password-protect/) and [auth0](/docs/plugins/auth0/) plugins, client IP ranges are not configured in the `aerobatic.yml`. This means you can change them anytime with the CLI without having to re-deploy your site.
{{% /alert %}}

#### My IP Shortcut

Oftentimes it's handy to lock the site down to your current machine's IP address. To save you from having to go look it up in your network settings, we provide an easy shortcut. Simply pass the string "myip" for the `--value` option:

{{<cli "aero clientip --value myip">}}

You can of course use this shortcut in conjunction with the `--stage` option:

{{<cli "aero clientip --value myip --stage demo">}}
