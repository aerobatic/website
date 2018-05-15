---
title: Overview
name: overview
---

# Overview

Aerobatic is a specialized platform for efficient delivery of static webpages and website assets. We take care of the configuration details for you that provide the best balance of performance and maintainability. Stop fiddling with CDNs and web server configs and focus on coding great front-end experiences.

## Performance {#performance}

Aerobatic utilizes a multi-layered global CDN so no matter where in the world your website visitors come from, the request is routed to the lowest latency servers. Website requests are initially routed to the optimal [AWS CloudFront edge node](https://aws.amazon.com/cloudfront/details/) (located throughout the world). Many assets such as images, JavaScripts, stylesheets, etc. are delivered directly from CloudFront. Your webpage requests are passed along to the lowest latency Aerobatic origin server (currently Oregon or Frankfurt, Germany with plans to expand to other regions). All resources are served with [optimal caching headers](/docs/static-serving#cache-headers) by default.

![CDN World Map](https://www.aerobatic.com/media/docs/cdn-world-map.png)

{{% alert tip %}}
Our friends at [Dotcom Monitor](https://www.dotcom-tools.com/) provide a great [**free webpage speed test**](https://www.dotcom-tools.com/website-speed-test.aspx) that allows you to easily measure your website perormance from 25 different physical locations around the globe. This is a great way to visualize the real-world impact of serving website assets from a nearby CDN node vs. a central origin server.
{{% /alert %}}

## Security {#security}

All Aerobatic sites are served exclusively via SSL. All `http://` requests are 301 redirected at the CDN edge to the `https://` equivalent. Custom domains (included in Pro Plan) include a wildcard auto-renewing SSL certificate &mdash; set it once and never worry about certs again.

For additional security you can declare the [http-headers plugin](/docs/plugins/http-headers/#security-headers) in your `aerobatic.yml` to append [OWASP](https://www.owasp.org/index.php/Main_Page) recommended headers to your HTTP responses.

#### Website user authentication {#authentication}

You have two options for locking down all or parts of your website to authenticated users only:

1.  [password-protect plugin](/docs/plugins/password-protect) - Simple password that you distribute to people that need access.
2.  [auth0 plugin](/docs/plugins/auth0) - Full featured identity management that allows signups and individual user accounts powered by [Auth0](https://auth0.com).

### How authentication works

Both the password-protect and auth0 plugins utilize a shared cookie based security mechanism to ensure that only authenticated users can access webpage urls from the protected section of the site.

* Upon successful login credentials being submitted, a [json web token](https://jwt.io/) (JWT) is generated with a crypto token that is only known to the Aerobatic backend.
* This JWT is set as the value of the `aerobatic-auth` cookie. This cookie is set with the `HttpOnly` and `Secure` flags, so it is inaccessible to client-side JavaScript and is only transmitted by the browser for `https` connections.
* The expiration date of the cookie can be controlled via the `cookieExpiresMinutes` plugin option. If no value is specified the default behavior is a session cookie that expires when the browser tab is closed. Setting to an explicit value is useful if you want logged in sessions to persist across browser sessions.
* When an inbound request is made to a URL protected by one of the auth plugins, the server code grabs the value of the `aerobatic-auth` cookie. If the cookie is missing, the user is redirected to the login page. If the cookie is present, it is decrypted with the secure token and the contents are verified to ensure it has not been tampered with. If everything checks out, the requested webpage is returned.
* Auth protected webpages are returned with the header `Cache-Control: no-cache`. This ensures that the CDN and browser do **not** cache the response. Note that because of Aerobatic's geo-distributed origin servers, you still get edge delivery benefits even without serving from the outer-most CDN nodes.
* The same cookie validation process happens for both human generated requests and bots. So there's no way for crawlers to obtain access to your protected pages.

### Custom 404 page {#custom-404}

Custom `404` error pages are specified with the [custom-errors](/docs/plugins/custom-errors/) plugin.

```yaml
plugins:
  - name: custom-errors
    options:
      errors:
        404: errors/404.html
```

### Web logs {#weblogs}

You can follow your web logs in near real-time using the either the [aero logs](/docs/cli/#logs) command or in the web control panel. In addition to the usual web log fields such as URL, method, response code, etc. we also include the physical location of the end user by geo-location of their IP address.

### Site scanner

The site scanner crawls and examines the content of your website after each deployment. Currently the only function of the scanner is to build the search index for the [keyword-search](/docs/plugins/keyword-search) plugin, but it has been designed to offer additional site services for catching broken links and performing SEO audits. See the [site-scanner configuration](/docs/configuration/#site-scanner) for further details.

### Device preview

You can tack on a `__preview={laptop|desktop|phone|tablet}` to any Aerobatic website URL to load it in a special viewer that simulates how the site looks on different device types. The value of the `__preview` querystring parameter determines the default selected device. For example, here is the URL to preview aerobatic.com on a phone: [https://www.aerobatic.com/?\_\_preview=phone](https://www.aerobatic.com/?__preview=phone). This is a handy way to share a URL with stakeholders so they can get a sense for how the site looks on different devices without having to actually load it on a phone, a tablet, etc.
