---
plugin: true
title: Health check plugin
name: health-check
---

# Health check plugin

The `health-check` plugin is intended to be used for automated services that hit your site to monitor uptime, performance, overall site health, etc. So instead of configuring your monitoring service to point to your home page, instead point it to something like: `https://www.yourdomain.com/health`.

This plugin intercepts the request and overrides the `Cache-Control` header to `no-cache` so your health check requests always hit the nearest origin servers and return a `200` status code. Behind the scenes, all internal Aerobatic server caching is bypassed as well. This ensures that your health checks are performing the most comprehensive request possible.

Requests to the health check path will not get written to your [web logs](/docs/overview#weblogs), avoiding having to wade through a flood of bot requests.

### Usage

```yaml
plugins:
  - name: health-check
    path: /health
```

You still need to create a `.html` file corresponding to the `path`, in this case `health.html`. Some monitoring services allow you to specify a pattern of text to look for to prove the page is being served correctly so this html page gives you the opportunity to control whatever that text is.

### Hiding from search engines

You probably don't want your health check page to be indexed by search engines. To prevent it from being discovered, add the following to your `robots.txt` (adjusted for your specific configuration):

```text
User-agent: *
Disallow: /health
```
