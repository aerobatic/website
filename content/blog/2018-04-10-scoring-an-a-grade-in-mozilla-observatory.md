---
title: Scoring an A Grade in Mozilla Observatory Security Scan
description: Using the Aerobatic http-headers plugin to score an A in Mozilla Observatory 
date: 2018-04-10
slug: scoring-an-a-grade-in-mozilla-observatory
---

I recently learned about [Mozilla Observatory](https://observatory.mozilla.org/) security site scanner. It examines your markup and HTML headers and scores your site with a letter grade. I was a bit chagrined to see our https://www.aerobatic.com receive a failing F grade 😞. As a web company promoting best practices we should do better, time to hit the books and improve that mark.

## Content Security Policy

First it's worth getting to understand a bit about Content Security Policy (CSP). Here's how the [MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) summarizes it:

> **Content Security Policy** (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks, including Cross Site Scripting (XSS) and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware.

With the `Content-Security-Policy` http header it is possible to specify a set of rules for the browser dicating what content sources are valid. The policy can specify different rules depending on the resource type, i.e. scripts, stylesheets, images, etc. You can also specify whether inline script and styles are allowed to be executed. The more strictly you lock this down, the more secure your site, and the better grade Observatory will grant.

The strictest possible CSP is `"Content-Security-Policy": "default-src 'self'"`. This states that all resource types can only be loaded from the same the same domain as the website itself (sub-domain included), and no inline scripts, styles, or dynamic script evaluation are allowed. If you aren't loading resources from any 3rd party domains or using 3rd party libraries, this gold standard should be readily achievable. However as soon as you start to utilize things like Google Analytics, Google Fonts, 3rd party CDN hosted scripts or stylesheets such as [cdnjs](https://cdnjs.com/), or other client-side widgets (Disqus, Buffer, and so on) the story gets more complicated quickly. Google Analytics, in particular, presents some challenges which I'll discuss further considering its ubuiquitousness.

The [MDN article on CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) is an excellent resource for learning more.

## Http Headers Plugin

Aerobatic provides the [http-headers plugin](/docs/plugins/http-headers) plugin which makes it easy to append additional HTTP headers to webpage responses. It is declared in the [aerobatic.yml](/docs/configuration/) file and looks like so:

```yml
plugins:
  - name: http-headers
    options:
      "Content-Security-Policy": "default-src 'self'"
```

## More Security Headers

The `Content-Security-Policy` is far from the only security related HTTP header. Additional ones include:

* [x-xss-protection](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection)
* [strict-transport-security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
* [x-frame-options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)
* [x-content-type-options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

You could certainly configure each of these headers individually in the `http-headers` declaration. However there is a shortcut `security` property that you can set to `true` which will provide the recommended values for all of these. You can always set the property to true and explicitly override individual header values. In fact the `security` property will specify a default CSP value also, but this is the one that most likely needs to be fine-tuned for your website.

```yml
plugins:
  - name: http-headers
    options:
      security: true
      "Content-Security-Policy": "default-src 'self'"
```

## Google Analytics

As mentioned earlier, making GA play nicely with CSP is not terribly straightforward. This [deep dive](https://www.lunametrics.com/blog/2017/07/20/using-google-analytics-google-tag-manager-content-security-policy/) goes into much greater detail than I'll cover here, but here's the basic ingredients for a GA friendly CSP:

* List `data:` scheme-src in the `image-src`
* List `https://www.google-analytics.com`, `https://www.google.com`, and `https://stats.g.doubleclick.net` in the `image-src`.
* List `https://www.google-analytics.com` in the `script-src`.
* Move the GA inline script snipipet to an external `.js` file to avoid needing to enable `unsafe-inline` as a `script-src`.

Here's what the resulting CSP looks like:

```sh
default-src 'none'; img-src 'self' data: https://www.google-analytics.com https://www.google.com https://stats.g.doubleclick.net; script-src 'self' 'unsafe-eval' https://www.google-analytics.com; style-src 'self'; font-src 'self'; connect-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'self'
```

## Eliminating inline script

Disallowing inline JavaScript in the CSP by **NOT** including `unsafe-inline` in the `script-src` is something that Mozilla Observatory explicitly checks for. This is a common practice in web development and the technique that most JavaScript based service plugins such as GA, Disqus, Facebook SDK, and so on direct you to use. This is probably because it happens to be the simplest implementation, but in most cases placing the integration code in an external script should work exactly the same. However there are always the possibility of gotchas. Depending on how deeply entrenched inline script is on your site, eliminating it might not be a realistic goal.

One common technique in JavaScript heavy web apps is for the server to emit a big chunk of JSON into an inline global variable in the HTML source. Then the client script reads from that to bootstrap the application. An inline-script free alternative approach would be to dump the stringified JSON data into a hidden div. Then the client script simply grabs it using `JSON.parse(document.getElementByID('appData')).innerText`.

## Subresource Integrity

If you are loading assets off a separate CDN domain, you should consider utilizing one that offers [sub-resource integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity). This mitigates the possibility of a compromised script getting executed by ensuring that the contents of the file match a cryptographic hash specified in the `<script>` or `<link>` tag. [Cdnjs](https://cdnjs.com/) allows you to copy an HTML tag snippet that has the `integrity` attribute.

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="></script>
```

You can boost your Observatory score if **all** your external domain resources utilize a sub-resource integrity. Unfortunately Google Fonts and Google Analytics both do not support SRI.

## Our Content Security Policy

For our www.aerobatic.com site, here is the configuration in our `aerobatic.yml` that we landed on.

```yml
plugins:
  - name: http-headers
    options:
      security: true
      "Content-Security-Policy": "default-src 'none'; img-src 'self' data: https://www.google-analytics.com https://www.google.com https://stats.g.doubleclick.net; script-src 'self' 'unsafe-eval' https://www.google-analytics.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self' https://*.algolianet.com https://*.algolia.net; form-action 'self'; base-uri 'self'; frame-ancestors 'self'"
```

With these changes we were able to raise our Observatory score from that shameful F to an **A-**. Not perfect, but pretty respectable. https://observatory.mozilla.org/analyze/www.aerobatic.com

<img style="max-width: 600px" src="//www.aerobatic.com/media/blog/mozilla-observatory.png">

I'd encourage you to test your own site on https://observatory.mozilla.org. With just a few lines of YAML, you can likely make a big improvement in your score. It's a good idea to experiment with different `Content-Security-Policy` header values on a [test stage](/docs/deployment/#deploy-stages) first. Then deploy it to production when you are confident that your policy does not break any functionality.

{{<cli "aero deploy --stage test">}}
