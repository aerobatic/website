---
title: Easy Continuous Deployment of Hugo Sites
description: Aerobatic builds, deploys, and hosts your Hugo site all from Bitbucket. Simple!
slug: easy-hugo-continuous-deployment
comments: true
date: 2016-03-09
tags: hugo, static site generator, cd
---

<div style="text-align: center; margin-bottom: 20px;">
<img src="//www.aerobatic.com/media/logos/hugo-logo.png" style="max-width: 100%; max-height: 200px;">
</div>

We're big fans of [Hugo](http://gohugo.io/), the popular static site generator. That's why we're especially excited to let you know that Aerobatic now builds, deploys, and hosts Hugo sites.

Until now, if you wanted to host a Hugo site, you needed to do the build somewhere else - either on your local machine or by using a separate CI tool, and then push the built assets to your preferred hosting solution. Not anymore. Hugo is now a first class citizen on Bitbucket, just like Jekyll is on GitHub Pages. Less context switching. Less complexity. Faster deployments. And all the extra things you'll need for your site like SSL, auth, custom errors, redirects, and more, all from within Bitbucket.

This blog post covers the high level, see the [hugo docs](/docs/automated-builds#hugo) for more in-depth information.

## Enabling Automated Builds
To inform the Aerobatic build process to use Hugo, just declare the following snippet in your `package.json` [manifest](/docs/configuration#website-manifest). You can, of course, use any Hugo theme of your choosing with the `themeRepo` option. Just tell Aerobatic where the theme's git repo is.

~~~json
{
  "_aerobatic": {
    "build": {
      "engine": "hugo",
      "themeRepo": "https://github.com/alexurquhart/hugo-geo.git"
    }
  }
}
~~~

The Aerobatic **Deployment settings** should specify the root directory `/` as the deployment target, **not** the `public` directory (that shouldn't even be in the repo at all now).

In the Bitbucket add-on, you can view the Hugo log output for each build/deployment:

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/hugo-builds.png" alt="Hugo build log screenshot">

## Editing in Bitbucket

The great thing about this is that you can now just author posts directly in Bitbucket, make a commit, and Aerobatic will automatically deploy a new version of your Hugo site for you.

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/hugo-edit-bitbucket.png" alt="Hugo edit in Bitbucket screenshot">

## Summary

If you haven't hosted your sites before with Bitbucket and Aerobatic, it's easy to [get started](/docs/getting-started). We'll have your site live in less than a minute. Once you've got your Hugo site on Aerobatic, you can then add more functionality, such as [password protecting](/blog/password-protect-a-hugo-site) your site.

Here's a link to the [demo repo](https://bitbucket.org/dundonian/wee-hugo/src), just in case.

By the way, we also now automatically [build Jekyll sites](/blog/automated-continuous-deployment-of-jekyll-sites), and we're quickly adding more static site generators. Feel free to let us know if you have a favorite you want us to support!
