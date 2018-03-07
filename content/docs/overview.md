---
title: Overview
name: overview
---

# Overview

Aerobatic is a specialized platform for efficient delivery of static webpages and website assets. We take care of the configuration details for you that provide the best balance of performance and maintainability. Stop fiddling with CDNs and web server configs and focus on coding great front-end experiences.

## Performance {#performance}

Aerobatic utilizes a multi-layered global CDN so no matter where in the world your website visitors come from, the request is routed to the lowest latency servers. Website requests are initially routed to the optimal [AWS CloudFront edge node](https://aws.amazon.com/cloudfront/details/) (located throughout the world). Many assets such as images, JavaScripts, stylesheets, etc. are delivered directly from CloudFront. Your webpage requests are passed along to the lowest latency Aerobatic origin server (currently Oregon or Frankfurt, Germany with plans to expand to other regions). All resources are served with [optimal caching headers](/docs/static-serving#cache-headers) by default.

![CDN World Map](https://www.aerobatic.com/media/docs/cdn-world-map.png)

## Security {#security}

All Aerobatic sites are served exclusively via SSL. All `http://` requests are 301 redirected at the CDN edge to the `https://` equivalent. Custom domains (included in Pro Plan) include a wildcard auto-renewing SSL certificate &mdash; set it once and never worry about certs again.

For additional security you can declare the [http-headers plugin](/docs/plugins/http-headers/#security-headers) in your `aerobatic.yml` to append [OWASP](https://www.owasp.org/index.php/Main_Page) recommended headers to your HTTP responses.

#### Website user authentication {#authentication}

You have two options for locking down all or parts of your website to authenticated users only:

1.  [password-protect plugin](/docs/plugins/password-protect) - Simple password that you distribute to people that need access.
2.  [auth0 plugin](/docs/plugins/auth0) - Full featured identity management that allows signups and individual user accounts powered by [Auth0](https://auth0.com).

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
