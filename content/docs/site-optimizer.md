---
title: Site Optimizer
name: site-optimizer
description: Deploy-time website optimizations
---

# Site Optimizer

At deploy time Aerobatic can be configured to provide additional pre-processing to your source code to optimize the delivery of your HTML pages, JavaScripts, stylesheets, images, etc. These optimizations improve the download performance of your site, especially on slower mobile networks. This is important not only for the user experience, but increasingly for SEO as Google's algorithms place greater emphasis on mobile usability. Over time Google plans to phase into a [mobile-first](https://webmasters.googleblog.com/2016/11/mobile-first-indexing.html) index.

Google has long taken a leadership role in promoting web optimization best-practices and the techiques taken by Aerobatic are taken directly from their [Web Fundamentals Performance Guide](https://developers.google.com/web/fundamentals/performance/).

The optimizations currently supported are:

* [Asset fingerprinting](#asset-fingerprinting)
* [Critical CSS Inlining](#critical-css-inlining)

### Configuration

The site optimizer is configured in the `deploy` section of the `aerobatic.yml` manifest.

~~~yaml
deploy:
  optimizer:
    fingerprintAssets: true
    inlineCriticalCss: true
    archetypes:
      - pattern: index.html
~~~

### Asset fingerprinting

[Fingerprinting](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching#invalidating-and-updating-cached-responses) is a technique that entails embedding a string into URLs uniquely identifies the current version of the asset. Whenever the underlying asset changes, the unique string changes forcing the browser to treat it as a new object. This allows for setting aggressive cache-headers because there's no risk in serving a stale version.

 The Aerobatic optimizer scans your `.html` and `.css` files and rewrites links to static assets such as `.js`, `.css`, `.jpg`, and so on. The pre-processor calculates an md5 hash based on the current contents of the referenced file and injects it into the source code. For example, if you deploy an html file with the following markup:

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

The Aerobatic CDN detects requests with the special `--md5--` pattern and sets a `max-age` of one year. 

~~~text
Cache-Control: public, max-age=31557600
~~~

When you deploy new versions of your website, the assets that have not actually changed since the previous deployment will have the same hashed URL pointing to the previously cached copies. In the event that you make a tweak to an html page, website visitors will immediately get the freshest copy of the HTML, but still utilize cached versions of your site's JavaScript, stylesheets, and images - meaning faster page load times for your website visitors. If you do make a change to one of the hashed assets, then a new hashed URL will result, orphaning the old copy, and forcing the CDN to fetch the latest from the origin server which will be aggressively cached once again.

This also works with assets linked in stylesheets. For example:

~~~css
div.hero { background-image: url(../images/hero.jpg) };
~~~

Becomes:

~~~css
div.hero { background-image: url(../images/hero--md5--903u435ilje434kvns.jpg) };
~~~

The following diagram depicts the cache headers returned by the parent .html page and it's nested assets:

<img src="/img/caching-diagram.png" />

This provides the best of both worlds: high cache utilization and instant updates when necessary. Asset fingerprinting is enabled by default, even if you don't have an `optimizer` section in your `aerobatic.yml`. If you want to turn it off, you can explicitly do so:

~~~yaml
deploy:
  optimizer:
    fingerprintAssets: false
~~~

### Critical CSS Inlining

When a web browser encounters a stylesheet link, page rendering is blocked until the CSS is fully downloaded and interpreted. This is known as a [render blocking resource](https://developers.google.com/web/fundamentals/performance/critical-rendering-path/render-blocking-css). In order to avoid the dreaded [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content) (flash of unstyled content), stylesheets are typically placed in the `<head>` of the document. But this means that on a slow network connection, the user could be stuck looking at a blank white screen.

The optimal solution is to extract the CSS rules required to style the above the fold content (the critical css) in a `<style>` block that the browser doesn't have to make a separate network call to fetch over the network. This ensures the user has rendered content on the page as quickly as possible. The remaining CSS is then fetched asynchronously so by the time they start scrolling down, the below the fold content has been styled.

Removing CSS downloads from the critical rendering path can make a significant different to the perceived load time of a webpage &mdash; we've seen 30+ point improvements on the [PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) score. But it's not an optimization that is freqently made due to the challenges in isolating the critical CSS. The Aerobatic optimizer can do it for you with just a few configuration settings.

The changes made by the optimizer are best illustrated with a simple example. Here's the original `.html` file deployed to Aerobatic:

~~~html
<html>
  <head>
    <title></title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="blue">This is blue</div>
  </body>
</html>
~~~

With critical CSS inlining enabled, the optimizer would re-write it to the following:

~~~html
<html>
  <title></title>
  <style id="critical-css">
    .blue{background-color: blue}
  </style>
  <noscript id="deferred-css">
    <link rel="stylesheet" href="styles.css" />
  </noscript>
  <script>
    window.addEventListener("load", function() {
      var deferredStylesNode = document.getElementById("deferred-css");
      var criticalCssNode = document.getElementById("critical-css");
      criticalCssNode.insertAdjacentHTML("beforebegin", deferredStylesNode.textContent);
      deferredStylesNode.parentElement.removeChild(deferredStylesNode);
    });
  </script>
  <body>
    <div class="blue">This is blue</div>
  </body>
</html>
~~~

**Here's what's happening:**

* The CSS rules needed to style the above the fold content are inlined into a `<style>` block in the head
* Next the original linked stylesheets are nested in a `<noscript>` tag.
* A small bit of JavaScript is injected that reads the contents of the `<noscript>` block and appends the `<links>` above the inline critical css.

#### Real World Example

For a more real world example we generated a new site on Aerobatic using our Start Bootstrap Agency starter kit. We deployed it both with and without the critical CSS inline optimization, running each through PageSpeed Insights. The results are summarized below:

Mode | URL | Desktop Score | Mobile Score | PageSpeed Results |
---|---|---|---|---
**Without** critical CSS inlining | https://critical-css-demo.aerobaticapp.com/ | 90 / 100 | 74 / 100 | [View Results](https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Fcritical-css-demo.aerobaticapp.com%2F)
**With** critical CSS inlining | https://critical-css-demo--optimized.aerobaticapp.com | **98** / 100 | **98** / 100 | [View Results](https://developers.google.com/speed/pagespeed/insights/?url=https%3A%2F%2Fcritical-css-demo--optimized.aerobaticapp.com%2F)

Source code for the demo is available at: https://github.com/aerobatic/critical-css-demo

### Configuration

~~~yaml
deploy:
  optimizer:
    inlineCriticalCss: true
    forceCriticalCss: [h2, h3]
    ignoreStylesheets: []
    archetypes: []
~~~

{{% option "inlineCriticalCss" %}}
Boolean used to enable the critical css optimization.
{{% /option %}}

{{% option "forceCriticalCss" %}}
Array of rules or regular expressions that should be forced into the critical CSS section (Optional).
{{% /option %}}

{{% option "ignoreStylesheets" %}}
Array of stylesheet URL patterns that should be ignored by the optimizer. They will remain unchanged in the .html source. (Optional).
{{% /option %}}

{{% option "archetypes" %}}
Array of archetypes that represent families of pages with the same CSS profile. (Optional).
{{% /option %}}

### Archetypes

In order to analyze which CSS rules are critical a headless browser is spun up in the Aerobatic deployment infrastructure. Because this is a time intensive process, it's not practical to do this for every single `.html` file for sites that have more than just a few pages. Instead the optimizer only runs the CSS analysis on a set of representative pages and the results are re-used on all the other pages of the same family, i.e. blog posts, home page, etc. These families are called `archetypes` in the configuration and are identified by a file name pattern. The assumption is that all the .html files that match the pattern share the same CSS profile.

~~~yaml
deploy:
  optimizer:
    inlineCriticalCss: true
    archetypes:
      - pattern: index.html # home page
      - pattern: about.html # about page
      - pattern: blog/**    # all the files nested under the blog directory
~~~

You can specify up to 10 archetypes.

{{% alert tip %}}
**TIP:** If you don't specify any archetypes, a single archetype will be setup for you that only matches your home page `index.html` (assuming `inlineCriticalCss` is true). This means only your homepage will be optimized which, for a single landing page site, is all you need anyway.
{{% /alert %}}

### Force Critical CSS

After initially enabling the CSS inliner, you may discover that you are still seeing a FOUC. The analyzer doesn't always catch every rule so you may need to force specific rules to be treated as critical. This can be done with the `forceCriticalCss` property which takes an array of strings or regular expression matches.

~~~yaml
deploy:
  optimizer:
    forceCriticalCss:
      - ".iShouldBeCritical" # exact rule match
      - "h2" # Match all rules for h2 tag
      # match all rules with ".markdown", i.e. ".markdown > h2",
      # ".markdown > pre", etc.
      - "regex:\\.markdown"  
~~~

{{% alert tip %}}
**TIP:** Note that the "regex:" prefix in the value above. This is the convention for configuring regular expression strings in the `aerobatic.yml`. Also the additional backslash is there to ensure valid YAML.
{{% /alert %}}

You can also set a `forceCriticalCss` property at the archetype level. In this case the effective value for that archetype is the combined values of the two arrays. For example:

~~~yaml
deploy:
  optimizer:
    forceCriticalCss:
      - ".iShouldBeCritical" # exact rule match
    archetypes:
      - pattern: index.html
        forceCriticalCss:
          - ".iAlsoShouldBeCritical"
~~~

### Ignoring Stylesheets

You can specify that certain stylesheets should be left alone with the `ignoreStylesheets` property. Any substring match will be left as-is in the source html.

~~~yaml
deploy:
  optimizer:
    inlineCriticalCss: true
    ignoreStylesheets:
      - bootstrap
~~~






