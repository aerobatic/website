---
title: Static serving
name: static-serving
---

# Static website serving

Aerobatic is a specialized platform for efficient delivery of static webpages and website assets. We take care of the configuration details for you that provide the best balance of performance and maintainability. Stop fiddling with CDNs and web server configs and focus on coding great front-end experiences.

### Serving webpages

When a visitor hits the base URL for your website like `https://site-name.aerobatic.io` or `https://custom-domain.com`, Aerobatic looks for a `index.html` file at the root of your deployment directory. Requests for nested paths (`/about`, `/blog/article-name`) are translated to a `.html` file at the same location in the folder hierarchy. So `/about.html` and `/blob/article-name.html`.

### Trailing slashes

If you've ever configured a web server you'll know that trailing slashes can pose a challenge. Standard web server behavior for a request to `/blog/` (with trailing slash) is to look for a file at `/blog/index.html`. But what happens if the trailing slash is omitted in the request? Many web servers will just return a 404. Aerobatic has intelligent fallback detection that will `301` redirect if there exists an alternative page. So a request for `https://site.com/blog` will automatically redirect to the trailing slash version `https://site.com/blog/` if (and **only** if) the file `/blog/index.html` exists. The inverse is true for trailing slash to non-trailing slash. This helps reduce `404` errors for common URL permutations.

### Canonical URLs

Aerobatic applies best-practice conventions for redirecting to the "pretty" canonical form of requested URLs including all lowercase and stripping off the `.html` extension. This has the effect of ensuring that every webpage on your site can only be accessed with the one "true" URL. Other variations (trailing slashes, letter case, and file extensions) `301` redirect to the official URL. This has big [SEO benefits](https://support.google.com/webmasters/answer/139066?hl=en) as it ensures that search engines don't dilute the value of your pages with multiple copies competing against each other.

The table below illustrates how Aerobatic handles some common scenarios with __no__ special configuration on your part:

| Request URL   | File exists test | Render page | Redirect url | Response Code |
| ------------- | --------- | ------------- | ----------- | -------- |
| `/blog` | `/blog.html == true` | `/blog.html` | | `200` or `304` |
| `/blog.html` | | | `/blog` | `302` |
| `/blog/` | `/blog/index.html==true` | `/blog/index.html` | | `200` or `304` |
| `/blog/` | `/blog/index.html==false`<br>`/blog.html == true` | | `/blog` | `302` |
| `/blog/` | `/blog/index.html==false`<br>`/blog/index.xml == true` | `/blog/index.xml` | | `200` or `304` |
| `/blog/` | `/blog/index.html==false`<br>`/blog/index.xml==false`<br> `/blog/index.json==true` | `/blog/index.json` | | `200` or `304` |
| `/blog` | `/blog.html==false`<br>`/blog/index.html==true` | | `/blog/`| `302` |
| `/blog/index` | | | `/blog/` | `301` |
| `/About-Us` | `/About-Us.html==false`<br>`/about-us.html==true` | | `/about-us` | `301` |
| `/favicon.ico` | `/favicon.ico==true` | `/favicon.ico` | | `200` or `304` |
| `/favicon.ico` | `/favicon.ico==false` | default favicon | | `200` or `304` |
| `/*` | No condition matches | Default or custom error page | | `404` |

## Cache headers

Aerobatic out of the box serves your site using industry standard HTTP  performance best practices including [GZIP compression](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/optimize-encoding-and-transfer?hl=en#text-compression-with-gzip) and cache control headers. Aerobatic uses a multi-layered caching strategy based on the types of assets being served. Our approach closely mirrors these [Google web performance best-practices](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching).

### Webpage ETags {#etags}

Your web pages are served from our origin servers with an `ETag` header that uniquely identifies the current deployed version of your website. On subsequent requests, your visitors' browser will send an `If-None-Match` header corresponding to the previous `ETag`. Assuming a new version has not been deployed in the meantime, Aerobatic will return an empty `304 Not Modified` response informing the browser that the copy it has in cache is still valid. This cuts down considerably on the number of bytes sent over the network resulting in a faster site. Because the browser is forced to re-validate on each page request, you can be assured that all users will immediately get the most recent version after a new deployment and not a stale copy from cache.

### Asset acceleration

At deploy time, the Aerobatic deploy engine performs some minimal additional pre-processing to your source code to optimize the delivery of static assets such a JavaScript, stylesheets, images, etc.

The pre-processor calculates an md5 hash based on the current contents of all your non .html assets such as .js, .css, .jpg. Then your `.html` and `.css` files are scanned for references to these files and injects the corresponding hash value into the filename. For example, if you deploy an html file with the following markup:

~~~html
<div>
  <link rel="stylesheet" href="/css/styles.css" />
  <img src="/images/hero.jpg" />
  <script src="/js/app.js"></script>
</div>
~~~

It will look like this when served from the Aerobatic CDN:

~~~html
<div>
  <link rel="stylesheet" href="/css/styles--md5--934u5kl3jk5j453.css" />
  <img src="/images/hero--md5--359u46kld3i40u35.jpg" />
  <script src="/js/app--md5--eijtwk4ltj3lkj359kry.js"></script>
</div>
~~~

When these individual assets are served up they will have an aggressive cache header informing the CDN, the browser, and any caching layers in between, to keep serving the same cached version for a full year.

~~~text
Cache-Control: public, max-age=31557600
~~~

This way even if you deploy new versions of your website, the assets that have not actually changed since the previous deployment will have the same hashed URL pointing to the previously cached copies. In the event that you make a tweak to an html page, website visitors will immediately get the freshest copy of the HTML, but still utilize cached versions of your site's JavaScript, stylesheets, and images - meaning faster page load times for your website visitors. If you do make a change to one of the hashed assets, then a new hashed URL will result, orphaning the old copy, and forcing the CDN to fetch the latest from the origin server which will be aggressively cached once again.

This also works with assets linked in stylesheets. For example:

~~~css
div.hero { background-image: url(../images/hero.jpg) };
~~~

Becomes:

~~~css
div.hero { background-image: url(../images/hero--md5--903u435ilje434kvns.jpg) };
~~~

This technique, known as [fingerprinting](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching#invalidating-and-updating-cached-responses), provides the best of both worlds: high cache utilization and instant updates when necessary. With Aerobatic you get this automatically - no special build steps on your part.

### Caching Diagram

Here's a complete picture of the caching headers for the host html page along with the referenced assets:

<img src="/img/caching-diagram.png" />

### Single Page Apps

If you are deploying a single page app (SPA) with client-side routing, then your likely want to serve your main `index.html` page for all extension-less URLs. To force this behavior, just set the `pushState` property to `true` on the [webpage plugin](/docs/plugins/webpage/).

~~~yaml
plugins:
  - name: webpage
    options:
      pushState: true
---
~~~
