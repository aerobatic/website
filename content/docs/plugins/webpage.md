---
title: Webpage plugin
plugin: true
name: webpage
---

# Webpage plugin

The webpage plugin is the core plugin for serving up an HTML webpage. You don't have to explicitly declare this plugin, one will be created automatically if omitted. However by declaring it in your `plugins` array of `aerobatic.yml`, there are some additional options that you can control.

The webpage plugin should be declared at the **end** of the plugins array so that other plugins (such as [basic-auth](/docs/plugins/basic-auth/)) first have a chance to act on the request.

### Usage

~~~yaml
plugins:
  - name: webpage
    options:
      canonicalRedirects: true
      pushState: true
---
~~~

### Options

{{% option pushState %}}
If true, returns the `index.html` file no matter the request URL path. Valuable for single page applications where view routing is handled by a client JavaScript framework such as React, Angular, and Ember. Defaults to `false`.
{{% /option %}}

{{% option canonicalRedirects %}}
If `true`, performs a `301` redirect to the canonical extension-less, all lower-case form of the URL. The table below illustrates sample redirection behavior. Defaults to `true`.
{{% /option %}}

| Request URL   | Destination |
| ------------- | --------- |
| `/About/Contact.html` | `/about/contact` |
| `/blog/index.html` | `/blog/` |
| `/Blog/index` | `/blog/` |

{{% alert tip %}}
**TIP** If you explicitly set `canonicalRedirects` to `false` Aerobatic will serve the same page for requests to `/about` and `/about.html`. If you are concerned about duplicate content, you could utilize the `<link rel="canonical">` tag.
{{% /alert %}}
