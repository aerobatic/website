---
title: How To Password Protect A Jekyll Site
description: Add a login page to a Jekyll site in a few minutes without worrying about server-side code
slug: password-protect-a-jekyll-site
comments: true
date: 2016-01-13
tags: jekyll, passwords, login
---

{% alert warning %}
**UPDATE:** Aerobatic now has [built-in support](/blog/automated-continuous-deployment-of-jekyll-sites) for building Jekyll sites. You no longer need to rely upon an external CI service for this.
{% endalert %}

You've got a [Jekyll](https://jekyllrb.com/) site, and now you're wondering how to password protect some or all of the content. Perhaps the site is under development and you want to make it viewable to only your client for review. You could set something up on Heroku, but that's expensive and total overkill for a simple password form. When you made the smart move to a static generator instead of some CMS, presumably one of your goals was to negate the need for servers and databases altogether.

Well, the good news is that, with Aerobatic, you can create a login page for your Jekyll site with just a few lines of JSON. No servers. No dynos. No hassles. Want to see how easy it is? Let's go...

<a href="https://jekyll-auth.aerobatic.io/"><img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/auth/login.png"></a>

## Requirements
- A Bitbucket account
- A Jekyll site hosted on Aerobatic (see [docs](/docs/static-generators))
- Optionally, a [paid Aerobatic subscription](/pricing/) if, instead of the built-in browser dialog, you want your login to be a nice-looking branded page that's consistent with the rest of your site's aesthetic.

## Getting Started
In this example, we'll assume you're already on a paid plan. If not, you can refer to this [previous blog post](/blog/basic-auth-for-static-web-sites) to implement HTTP Basic auth with the built-in browser dialog for free.

### Create a login.html

In your Jekyll site, you've got an **index.html** in the root folder. Make a copy of that file and call it **login.html**. Replace the content of the login.html file with code similar to below. You can style your login page however you want. What's essential is that the form markup needs to be decorated with the `data-basic-auth-form`, `data-basic-auth-username`, and `data-basic-auth-password` attributes as shown below. The `data-basic-auth-error` element will only be shown if invalid credentials are submitted.

~~~html
---
layout: [INSERT YOUR SITE'S LAYOUT]
---
<!doctype html>
<html>
<head>
<style>
h6.error {
  color: red;
}
</style>
</head>
<body>
<h6 class="error" data-basic-auth-error><strong>Invalid credentials</strong></h6>
<form data-basic-auth-form>
  <label for="username">Username</label>
  <input class="u-full-width" type="text" placeholder="username" id="username" data-basic-auth-username>
  <label for="password">Password</label>
  <input class="u-full-width" type="password" placeholder="password" id="username" data-basic-auth-password>
  <div>
    <input class="button-primary" type="submit" value="Submit">
  </div>
</form>
</body>
</html>
~~~

Make sure also that you actually are building your Jekyll site with these new changes i.e. from the command line, type `jekyll serve`.

### Create a package.json
This is where you'll take advantage of Aerobatic's built-in basic-auth plugin. Create a **package.json** file in the root of your Jekyll site and copy the following code block into it. For a full list of available options, refer to the [docs](/docs/http-basic-authentication).

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "module": "basic-auth",
        "options": {
          "username": "$CLIENT_USERNAME",
          "password": "$CLIENT_PASSWORD",
          "loginPage": "login.html",
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

Either from the command line, or with a tool like [Sourcetreee](https://www.sourcetreeapp.com/), push the changes to your Jekyll repository. e.g.

~~~bash
git add --all
git commit -m "Added a login page"
git push origin master
~~~

### Create environment variables

From the Aerobatic Hosting menu in Bitbucket, add [environment variables](/docs/configuration#environment-variables) for the username and password you want to protect your site with. In this example site, both the username and password are **aerobatic**. Presumably you'll want something a bit more cryptic!

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/auth/envvars.png">

## Summary

That's it! Your Jekyll site is now password protected with a branded login page. In this example, we've added protection to the whole site, but you can also add it to specific folders. For example, maybe your landing page is open to everyone, but you want your `/blog` content to be password protected. That's all possible with the [basic-auth](/docs/http-basic-authentication) plugin.

Additionally, maybe you want to handle the 401 error with a custom error page if the user incorrectly enters their credentials. Again, all possible with the Aerobatic [custom-errors](/docs/custom-error-pages) plugin.

Finally, you may also be interested in learning how to [post a Jekyll contact form to Slack](/blog/post-a-jekyll-contact-form-to-slack) or Hipchat.

The demo site for adding a custom login page can be found at [https://jekyll-auth.aerobatic.io/](https://jekyll-auth.aerobatic.io/) and the source code is on [Bitbucket](https://bitbucket.org/dundonian/jekyll-auth/src).
