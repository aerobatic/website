---
title: How To Password Protect A Hugo Site
description: Add a login page to a Hugo site hosted on Bitbucket
slug: password-protect-a-hugo-site
comments: true
date: 2016-01-16
tags: hugo, passwords, login
---

{% alert warning %}
**UPDATE:** Aerobatic now has [built-in support](/blog/easy-hugo-continuous-deployment) for building Hugo sites. You no longer need to rely upon an external CI service for this.
{% endalert %}

In a [previous post](/blog/hugo-continuous-integration-with-wercker-aerobatic-and-bitbucket), we showed how to set up Continuous Deployment for a Hugo site that's hosted with Aerobatic and Bitbucket, using Wercker to build our site.

In this tutorial, we'll add a login page to our Hugo site using the Aerobatic [basic-auth plugin](/docs/http-basic-authentication). No servers. No dynos. No hassles. Just a few lines of JSON and your login page will be live.

<a href="https://hugo-demo.aerobatic.io/"><img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/hugo-login.png"></a>

## Requirements
- A Bitbucket account
- A Hugo site hosted on Aerobatic (see [docs](/docs/static-generators))
- Optionally, a [paid Aerobatic subscription](/pricing/) if, instead of the built-in browser dialog, you want your login to be a nice-looking branded page that's consistent with the rest of your site.

## Getting Started
In this example, we'll assume you're already on a paid plan. If not, you can refer to this [previous blog post](/blog/basic-auth-for-static-web-sites) to implement HTTP Basic auth with the built-in browser dialog for free.

### Create a login.html

From the command line, type `hugo new login.html`. This new page will be automatically generated in your `/content` folder. You could have also created your file in the `/static` directory where Hugo will pass through whatever is in that directory into your built assets.

You can style your login page however you want. What's essential is that the form markup needs to be decorated with the `data-basic-auth-form`, `data-basic-auth-username`, and `data-basic-auth-password` attributes as shown below. The `data-basic-auth-error` element will only be shown if invalid credentials are submitted.

~~~html
+++
title = "Login"
+++
<style>
  h6.error {
    color: red;
  }
</style>

<h6 class="error" data-basic-auth-error><strong>Invalid credentials</strong></h6>
<form data-basic-auth-form>
  <label for="username">Username</label>
  <input class="u-full-width" type="text" placeholder="username" id="username" data-basic-auth-username>
  <label for="password">Password</label>
  <input class="u-full-width" type="password" placeholder="password" id="username" data-basic-auth-password>
    <input class="button-primary" type="submit" value="Submit">
</form>

<p>p.s. The username and password for this demo are both "aerobatic"</p>
~~~

### Create a package.json

This is where you'll take advantage of Aerobatic's built-in basic-auth plugin. Create a **package.json** file in the `/static` directory of your Hugo site and copy the following code block into it. For a full list of available options, refer to the [docs](/docs/http-basic-authentication).

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "module": "basic-auth",
        "options": {
          "username": "$CLIENT_USERNAME",
          "password": "$CLIENT_PASSWORD",
          "loginPage": "login/index.html",
          "maxFailedLogins": 5,
          "failedLoginPeriod": 600
        }
      },
      {
        "module": "webpage"
      }
    ]
  }
}
~~~

### Push your changes

Either from the command line, or with a tool like [Sourcetreee](https://www.sourcetreeapp.com/), push the changes to your Hugo repository. e.g.

~~~bash
git add --all
git commit -m "Added a login page"
git push origin master
~~~

### Create environment variables

From the Aerobatic Hosting menu in Bitbucket, add [environment variables](/docs/configuration#environment-variables) for the username and password you want to protect your site with. In this example site, both the username and password are **aerobatic**. Presumably you'll want something a bit more cryptic!

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/hugo-auth-env-vars.png">

## Summary

That's it! Your Hugo site is now password protected with a branded login page. In this example, we've added protection to the whole site, but you can also add it to specific folders. For example, maybe your landing page is open to everyone, but you want your `/post` content to be password protected. That's all possible with the [basic-auth](/docs/http-basic-authentication) plugin.

Additionally, maybe you want to handle the 401 error with a custom error page if the user incorrectly enters their credentials. Again, all possible with the Aerobatic [custom-errors](/docs/custom-error-pages) plugin.

The demo Hugo site can be found at [https://hugo-demo.aerobatic.io/](https://huo-demo.aerobatic.io/) and the source code is on [Bitbucket](https://bitbucket.org/dundonian/hugo-demo/src).
