---
layout: docs
plugin: true
title: CORS plugin
---

# CORS plugin

The `cors` plugin allows you to specify certain paths in your site to be accessible via client-side network calls from a different domain. For a good comprehensive tutorial, see the [Using CORS](https://www.html5rocks.com/en/tutorials/cors/) tutorial on HTML5 Rocks.

A common scenario is to declare this plugin before the [http-proxy](/docs/http-proxy) in your `plugins` configuration. However it could be used to provide CORS support for any subsequent plugin - for example serving static `.json` files (see example below).

This plugin is just a lightweight wrapper around the [expressjs/cors](https://www.npmjs.com/package/cors) module and accepts the same options.

### Usage

~~~yaml
plugins:
  - name: cors
    path: /api
    options:
      origin: https://www.anotherdomain.com

  - name: http-proxy
    path: /api
    options
      url: https://yourapi.com
---
~~~

### Options

All options are optional. By default all origins and methods are allowed. For a complete list of options, see the [cors module ](https://www.npmjs.com/package/cors#configuration-options) configuration options.

`origin`
: Either a string representing a specific remote origin to allow, i.e. `http://example.com`, or an array of origins. You can also specify a regex pattern to test whether the origin is allowed. Regex patterns are declared in `package.json` as strings with the special `regex:` prefix, i.e. `"/\.example2\.com$/"`.

`methods`
: Array of allowed HTTP methods for the `Access-Control-Allow-Methods` header. By default all methods are allowed.


### Pre-Flight Request

When making certain CORS request, such as with verbs other than `GET`, `POST`, or `HEAD`, or if custom headers are included in the request, the browser will make an initial `OPTIONS` request. This is known as pre-flighting. This functionality is automatically enabled in the plugin.

### CORS for static files

As mentioned above, with this plugin you can apply CORS support on any request served by Aerobatic including static files. Let's say you have a `/data` folder in your site with a bunch of `.json` files, you could use a configuration like so:

~~~yaml
plugins:
  - name: cors
    path: /data
    options:
      origin: https://www.anotherdomain.com
      methods: [GET]
---
~~~
