---
title: How To Password Protect A Static Website
subtitle:
slug: basic-auth-for-static-web-sites
date: 2015-10-15
comments: true
description: Add password protection to your static website in seconds with the Aerobatic HTTP basic auth plugin.
tags:
---

A common request from our customers, especially digital agencies, is to be able to password protect their web site such that clients can preview it while in development, while making sure that it's not accessible to the general public.

In the following example, we'll create a simple password protected site using the new Aerobatic `basic-auth` plugin.

<img class="img-responsive" src="//www.aerobatic.com/media/blog/auth/auth-demo.gif">

For this tutorial, we'll assume that you already have a static site [hosted with Aerobatic](https://aerobatic.atlassian.net/wiki/pages/viewpage.action?pageId=2097169), and now you just want to add authentication.

### Step 1: Create a package.json
Either create a `package.json` file, or in your repository's existing `package.json` file, add the following code block. Make sure the `package.json` file is in the root of your repository that you're hosting with Aerobatic.

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "module": "basic-auth",
        "path": "/protected",
        "options": {
          "username": "$BASIC_AUTH_USERNAME",
          "password": "$BASIC_AUTH_PASSWORD"
        }
      },
      {
        "module": "webpage"
      }
    ]
  }
}
~~~

In the example above, we've included an optional `path` attribute. In this case, only pages that are in the `/protected` folder require a username and password. If you want to protect the whole site, just omit the `path` attribute from the `package.json`.

### Step 2: Create Environment Variables
In the `package.json` file above, you'll notice that we have two environment variables, `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD`. In the Aerobatic dashboard page for your repo, click the *Environment Variables* link and add your two environment variables. These are the values that you'll give to the users that you want to permit access to your site. In the example below, both the username and password are "aerobatic." Presumably you'll want to create something a bit more secure :-)

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/auth/env-var.png">

### Step 3: Push your code
Push your updated repo with the newly created`package.json` file, and you're done!

### Sample App
- Sample web site that uses the Aerobatic `basic-auth` plugin: [http://auth-demo.aerobatic.io/](http://auth-demo.aerobatic.io/)
- Sample app code on Bitbucket: [https://bitbucket.org/aerobatic/auth-demo/src](https://bitbucket.org/aerobatic/auth-demo/src)
- Full documentation on basic authentication can be found on [4front.io](http://4front.io/docs/plugins/basic-auth.html) which is the open-source project that Aerobatic is built on.
