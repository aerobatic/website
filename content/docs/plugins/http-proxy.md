---
title: HTTP proxy plugin
plugin: true
name: http-proxy
---

# HTTP proxy plugin

The `http-proxy` plugin is a high performance, intelligent proxy that supports proxying AJAX requests to remote http endpoints. In addition to simple pass-through proxying, it also supports caching, parameter injection (to querystring, path, and body), as well as response transforms. In the `aerobatic.yml` router, you can define one or more instances of the proxy plugin.

For CORS support, declare this plugin in conjunction with the [cors plugin](/docs/cors).

### Configuration

Declare the proxy plugin in your `aerobatic.yml`:

~~~yaml
plugins:
  - name: http-proxy
    path: /api
    options:
      url: https://the-api.com
      query:
        key: $API_KEY
      headers:
        'custom-header': $CUSTOM_HEADER
---
~~~

### Basic Example

In this case, we’re defining our own `/api/geocode` endpoint on our Aerobatic web app which proxies to `maps.googleapi.com`. Additionally a `key` query string parameter is tacked onto the remote call with our Google API key which is stored as an environment variable.

~~~yaml
plugins:
  - name: http-proxy
    path: /api/geocode
    options:
      url: https://maps.googleapis.com/maps/api/geocode/json
      query:
        key: $GOOGLE_API_KEY
---
~~~

#### Client Code

To invoke this proxy endpoint in client JavaScript, we might do something like so:

~~~js
$.ajax({
  url: "/api/geocode",
  data: {
    address: "Timbuktu"
  },
  success: function(data) {
    console.log(data);
  },
  error: function(data) {
    console.error(data);
  }
});
~~~

The actual URL sent off to Google would then be: `https://maps.googleapis.com/maps/api/geocode/json?key=XYZ&address=Timbuktu`. Importantly the client JavaScript never has anything to do with the API key, that remains entirely on the server-side.

### Http Headers

The proxy will passthrough any http headers in the incoming request from the end user, but the plugin can be configured to tack on additional headers. A common example is hitting a URL that requires Basic Auth without exposing any credentials on the client.

~~~yaml
plugins:
  - name: http-proxy
    path: /api
    options:
      url: https://remote-endpoint.com/protected
      headers:
        Authorization: 'Basic $BASIC_AUTH_CREDS'
---
~~~

### Named Parameters Route Setup

If you are proxying many different operations to a remote API, it would be tedious to setup a separate virtual route for each and every endpoint. Instead you can use named parameters to configure all these routes in one go. For example say you are communicating with a remote API that exposes the following endpoints:

* `GET /widgets`
* `GET /widgets/123`
* `POST /widgets`
* `DELETE /widgets/123`
* `GET /users`

You can configure named parameters with optional path segments to proxy all of these endpoints in a single add-on declaration. By omitting the `method` property, all HTTP verbs will be matched.:

~~~yaml
plugins:
  - name: http-proxy
    path: /api-proxy/:resource/:id?
    options:
      url: https://some-remote-api.com/:resource/:id?
      query:
        apikey: $SOME_REMOTE_API_KEY
---
~~~

### Wildcard Routes

An even more flexible approach is to configure one route that will forward on all path segments starting with a `*`.

~~~yaml
plugins:
  - name: http-proxy
    path: /api/*
    options:
      url: https://some-remote-api.com/api/v1/*
      query:
        apikey: $SOME_REMOTE_API_KEY
---
~~~

The proxy will translate the incoming request to the origin API like so:

`GET /api/widgets/12345` __=>__
`GET https://remoteapi.com/api/v1/widgets/12345?apikey=xxx`

`POST /api/users` __=>__ `POST https://remoteapi.com/api/v1/users?apikey=xxx`

### Caching

For http responses that don't change frequently or to avoid strict rate-limits, Aerobatic allows you to specify a `cacheMaxAge` which forces 200 responses from the origin to be cached on the CDN for the specified number of seconds. This will override whatever `Cache-Control` header was returned from the origin (if it even had one). Subsequent requests to the same URL will be served directly from the CDN. This can be a great way to boost performance of calls to an endpoint is out of your control.

~~~yaml
plugins:
  - name: http-proxy
    path: /api/cacheable
    options:
      url: http://someapi.com/rarely-changes
      cacheMaxAge: 600   # Cache with TTL of 600 seconds
---
~~~

### Troubleshooting

When implementing the `http-proxy` plugin, it is often valuable to have visibility into what URL is being proxied to behind the scenes. For proxied requests, Aerobatic appends a `proxyUrl` property to the log entry which you can see by running the `logs` command:

~~~sh
[$] aero logs --format json
~~~

In the case of the [Basic Example](#basic-example) above, you'd see a log entry emitted similar to this:

~~~json
{
  "url": "https://www.yoursite.com/api/geocode",
  "method": "GET",
  "statusCode": 200,
  "timestamp": "2017-03-13T15:47:38",
  "ip": "123.123.123.123",
  "country": "US",
  "region": "WA",
  "city": "Seattle",
  "httpVersion":"1.1",
  "proxyUrl": "https://maps.googleapis.com/maps/api/geocode/json?key=XYZ&address=Timbuktu"
}
~~~

The logs will only capture those requests that are not served directly from the CDN so you shouldn't set the `cacheMaxAge` until you have confirmed the proxy is returning the correct response from the remote endpoint.
