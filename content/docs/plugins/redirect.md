---
title: Redirect plugin
plugin: true
name: redirect
---

# Redirect plugin

The `redirect` plugin allows specifying redirect rules for inbound URLs. You can specify either an explicit match or URL patterns. Two different rule types are supported: [Express route style](http://expressjs.com/en/guide/routing.html) or regular expressions. We recommend the Express style rules when possible because they are more intuitive, but for more advanced scenarios, such as redirecting based on querystrings, the flexibility of regular expressions is handy.

Each redirect rule is a key-value pair in the `options` where the key is the target URL pattern and the value is the destination to redirect to. The `redirect` plugin should be declared at the top of the `plugins` array so it has a chance to handle the request first.

By default redirects use the `301` response code indicating a permanent redirect, however you can use also specify a `302` redirect if you choose - see example below.

## Examples

Let's say you renamed an html file and you want a 301 redirect to inform bookmarks, search crawlers, etc. of the new destination, your declaration would look like this:

~~~yaml
plugins:
  - name: redirect
    options:
      /old-page-title: /new-page-title
      /another-old-page: /another-new-title
---
~~~

### Route patterns
Maybe you renamed an entire directory from `help` to `support`. In that case you can use a named pattern. The `:pageTitle` param from the inbound URL will be injected into the identically named parameter in the destination URL.

~~~yaml
plugins:
  - name: redirect
    options:
      "/help/:pageTitle": "/suppport/:pageTitle"
---
~~~

### Stripping file extensions

If you previously had a PHP site that you're converting to static (excellent choice BTW), you probably have loads of URLs out in the wild with `.php` extensions that you now want to now be clean and extension-less. This does require a straightforward bit of Regex. This will redirect `/about.php` to `/about`, `/blog/hello-world.php` to `/blog/hello-world`, and so on.

~~~yaml
plugins:
  - name: redirect
    options:
      "/*.php": /(.*)
---
~~~

<div class="alert warning" markdown="1">
  <strong>Tip</strong> The `.html` extension is stripped off automatically for you, so no need to specify a redirect for that.
</div>

### Regular expression rules
Regular expression rules are indicated by prefixing the key with `regex:`. The most common scenario not handled by Express routes is matching on a querystring parameter. For example if you want to redirect URLs like `/page.php?id=45` to `/articles/45` you could define a rule like so:

~~~yaml
plugins:
  - name: redirect
    options:
      "regex:/page.php\\?id=(:<id>[0-9]+)": "/articles/${id}"
---
~~~

The `(:<id>[0-9]+)` bit is a named capture that can then be referred to in the destination URL. Note the double backslash required to escape the question mark. Only named captures are supported.

<div class="alert warning" markdown="1">
<strong>Tip</strong> Make sure to use a double backslash to escape the question mark.
</div>

If you don't need to capture any parameters, you can simply specify a literal match for each from/to combination:

~~~yaml
plugins:
  - name: redirect
    options:
      "regex:/page.php\\?id=5": "/blog/hello-world",
      "regex:/page.php\\?id=6": "/blog/excellent-post"
---
~~~

### Specifying 301 or 302
By default redirects use the permanent 301 response code. This is usually the desired behavior when SEO is a concern. However there may be times when you want a temporary 302 redirect. You can pass an array as the destination value where the first element in the array is the response code and the second is the route pattern.

~~~yaml
plugins:
  - name: redirect
    options:
      /landing: [302, /]
~~~
