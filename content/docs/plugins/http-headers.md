---
layout: docs
title: HTTP headers plugin
plugin: true
---

# HTTP headers plugin

The `http-headers` plugin allows you to append additional HTTP headers to the response. If the `security` option is set to `true`, then a suite of industry standard security related headers will be included in the response. It's a really simple way to increase the security of your website.

### Usage

~~~yaml
plugins:
  - name: http-headers
    options:
      "X-Custom-Header": foo
      security: true
---
~~~

### Security headers

Setting the `security` option is a shortcut syntax for including many of the security related headers recommended by the Open Web Application Security Project ([OWASP](https://www.owasp.org/index.php/Main_Page)). Setting it to `true` is equivalent to the following:

~~~yaml
plugins:
  - name: http-headers
    options:
      # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
      "X-Content-Type-Options": nosniff
      # https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
      "Content-Security-Policy": "default-src 'self'"
      # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
      "X-Frame-Options": SAMEORIGIN
      # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection
      "X-XSS-Protection": "1;mode=block"
      # https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains"
---
~~~

If you want to override any of these values you can include an explicit value. Similarly if you want to eliminate one of the headers, just set it to an empty value.

~~~yaml
plugins:
  - name: http-headers
    options:
      security: true
      "X-Frame-Options": DENY
      "X-Content-Type-Options":
---
~~~

Will result in these headers being sent in the response:

~~~sh
Content-Security-Policy: "default-src 'self'"
X-Frame-Options: "DENY"
X-XSS-Protection: "1;mode=block"
Strict-Transport-Security: "max-age=31536000; includeSubDomains"
~~~

### More info
* [The Security of HTTP-Headers](https://www.contextis.com/resources/blog/security-http-headers/)
* [SecurityHeaders.io scanning service](https://securityheaders.io/)

{% alert tip %}
**TIP**: It's a good idea to test the security headers in a non-production [deploy stage](/docs/overview#deploy-stages) before you roll it out in production.
{% endalert %}
