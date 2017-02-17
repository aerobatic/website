---
title: Managing a CD release workflow with staging and production branches
description: How to configure continuous deployment to one or more staging environments and promote versions to production.
slug: managing-cd-releases-staging-production
comments: true
date: 2015-11-25
tags: CD, environments, staging, production, devops
---

{{% alert warning %}}
**DEPRECATED** This post refers to an older version of Aerobatic. Check out how we now handle CD release workflow using [deploy stages](/docs/overview/#deploy-stages).
{{% /alert %}}

Aerobatic has made it incredibly easy to deploy your production website with a simple `git push` command to your Bitbucket repo. Our [continuous deployment worker](http://www.aerobatic.com/blog/lambda-continuous-deployment.html) automatically grabs the latest source bundle, deploys it, and voilà, in less than a minute, your website is live to the world. This is the ultimate streamlined deployment flow for simple websites that are maintained by a single developer.

However for sites being built by a team of developers, or when building on behalf of a client, a more formal staged release process is often called for. In a typical workflow, in-progress changes are committed to a dedicated git branch that is not deployed to production. However clients and/or stakeholders usually want to be able to preview and approve website changes well before customers see it for real.

To solve this challenge, Aerobatic now provides a feature called __Deploy branches__ which lets you configure multiple git branches for continuous deployment. One or zero branches can be specified as "production" (more on this shortly) and up to 5 additional branches as staging instances of your site. Whenever a push is made to one of these staging branches your website is automatically deployed to a URL in the form `https://yourapp--test.aerobatic.io` where `test` is a URL-friendly alias for the branch name.

Here's a look at the __Deploy settings__ screen in the Bitbucket add-on:

  <img class="screenshot" src="//www.aerobatic.com/media/blog/deploy-branches/deploy-branch-settings.png" alt="Screenshot of the Aerobatic deploy branch setup">

And here is what the __Website versions__ view looks like with multiple staging branches in play. As I mentioned above, you don't need _any_ branches continuously deployed to production. You may wish to always manually promote a version using the actions drop down next to each deployed version. The goal is to provide enough built-in flexibility to adapt to different release workflows such as [Simple Git](http://blogs.atlassian.com/2014/01/simple-git-workflow-simple/), [GitHub flow](https://guides.github.com/introduction/flow/), or [gitflow](http://nvie.com/posts/a-successful-git-branching-model/).

  <img class="img-responsive marketing-feature-showcase--screenshot" src="http://www.aerobatic.com/media/blog/deploy-branches/promote-deployment.png" alt="Screenshot of the promoting a version to production">

This also makes it possible to support a workflow where clients or stakeholders, not developers, are responsible for promoting staged versions to production. Assuming these individuals have a Bitbucket account, they could login to the console and manage releases right in the Bitbucket GUI.

## Rollbacks

This ability to change which version of the site is live with a single click also makes rollbacks incredibly simple. And you never have to worry about users getting a stale version of the site from cache. Through our unique combination of HTTP cache header management and static asset [URL fingerprinting](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching#invalidating-and-updating-cached-responses), you can be assured that your users will always see the right version of the site upon their very next page load.

## Custom domains

If you are using a custom CNAME, you can still use staging URLs. Just put the branch alias name preceded by the double dash at the end of the first subdomain. For example if your custom CNAME is `www.example.com`, then the staging URLs would look like `www--test.example.com`, `www--preview.example.com`, etc. Note that you will have to register these CNAMEs with your DNS provider and point them to `_origin.aerobatic.io`. However you do not need to register these CNAMEs with your Aerobatic account, just registering the primary website domain is sufficient.

Things become a little more complicated when using both a custom CNAME and an SSL certificate. In this case you will need either a wildcard certificate, like `*.example.com`, or a multi-domain cert that includes both the primary CNAME and all staging CNAMEs. The CNAMEs in this setup would be configured with your DNS provider to point to the designated `*.cloudfront.net` domain and _also_ register it to your Aerobatic account in the domain management screen.

## Verifying version

Aerobatic injects a `__aerobatic__` global variable (the name is configurable) into the `<head/>` block of you web pages that is assigned to a plain JavaScript object containing contextual information and configuration settings. Below you can see that when the URL includes the `--staging` branch name, the global variable reflects the correct version name.

  <img class="img-responsive marketing-feature-showcase--screenshot" src="http://www.aerobatic.com/media/blog/deploy-branches/staging-browser-console3.png" alt="Screenshot of the promoting a version to production">

## Environment variables

When working with multiple instances of a website, a common need is for configuration settings that vary. Aerobatic uses  environment variables for configuration and now with Deploy branches you can override settings on a branch by branch basis. For example you might be using our [API proxy](http://www.aerobatic.com/docs/#sec5) to communicate with a remote REST api that has a production and test endpoints.

In the screenshot below the variable `API_URL` is configured with 3 different values. If it's not obvious, the `default` values are used for all branches that do not have an explicit override.

  <img class="img-responsive marketing-feature-showcase--screenshot" src="http://www.aerobatic.com/media/blog/deploy-branches/environment-vars.png" alt="Screenshot of environment variable management">

In the `package.json` we can configure the proxy to get the url of the origin API from the `API_URL` environment variable. By parsing the branch name out of the incoming URL, Aerobatic will know which environment variable values to use.

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "module": "express-request-proxy",
        "path": "/api",
        "options": {
          "url": "$API_URL"
        }
      }
    ]
  }
}
~~~

## Locking down staging URLs

Very likely you don't want your staging URLs to be accessible to the general public or to search crawlers. To prevent this, Aerobatic provides the [basic-auth plugin](/docs/plugins/#basic-auth) as a simple way to password protect a website. In the `package.json` manifest you can optionally declare a list of environments for which each plugin should be invoked. That allows you to enforce basic auth only on the staging branches but not on the public production site if you choose.

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "module": "basic-auth",
        "environments": ["preview", "test"],
        "options": {
          "username": "$BASIC_AUTH_USERNAME",
          "password": "$BASIC_AUTH_PASSWORD"
        }
      }
    ]
  }
}
~~~

For digital agencies, this is a great way to provide a private URL to your clients where they can track progress and provide feedback on pre-released website work.
