---
title: How to Create Custom Error Pages For Your Static Site
subtitle: Keep your users happy and on your site!
layout: post
comments: true
date: 2015-10-01
slug: custom-error-pages
description: Easily provide a custom 404 page for a better user experience by using the Aerobatic custom-errors plugin.
tags:
---

With the Aerobatic [add-on for Bitbucket](https://bitbucket.org/account/addon-directory/), we try to make hosting your static site as painless as possible. In fact, we think a lot about the common things web developers need and then try to provide them in a way that's simple and effective. Examples include CDN, SSL, custom domains, and our [API proxy](aerobatic-express-request-proxy.html).

Over time, you can expect to see us add more plugins to Aerobatic that'll make your job even easier. If you have some ideas, just [let us know](https://aerobatic.atlassian.net/servicedesk/customer/portal/1). One new plugin that we're happy to provide for our static hosting add-on is custom error pages.

You worked hard to get users to your site, and for whatever reason, something went wrong. No worries though, we've got you covered with our new `custom-errors` plugin. The plugin supports the following HTTP error codes: 400, 401, 403, 404, 500.

In the following example, we'll create a custom error page for a 404 Not Found error message.

### Step 1: Create a 404.html page
You can have this file in your root or in a sub folder such as `/errors`, for example. Add your cool Page Not Found content in your newly created `404.html` file.

~~~html
<html>
  <body>
    <h1>404 Page Not Found</h1>
    <p><a href="/index.html">Click here</a> to go home</p>
  </body>
</html>
~~~

### Step 2: Create a package.json
Either create a `package.json` file, or in your repository's existing `package.json` file, add the following code block. Make sure the `package.json` file is in the root of your repository that you're hosting with Aerobatic. In the example below, we're only defining the 404 error. You can choose to add a separate error page for each of the supported error codes.

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "module": "custom-errors",
        "options": {
          "errors": {
            "404": "errors/404.html"
          }
        }
      },
      {
        "module": "webpage"
      }
    ]
  }
}
~~~

### Step 3: Push your code
Push your updated repo with the newly created `404.html` and `package.json` files, and you're done!

### Sample App
* Basic web site that uses the Aerobatic `custom-errors` plugin: [http://custom-errors.aerobatic.io/](http://custom-errors.aerobatic.io/)
* Sample app code on Bitbucket: [https://bitbucket.org/aerobatic/custom-errors/src](https://bitbucket.org/aerobatic/custom-errors/src)
