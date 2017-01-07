---
title: How to Deploy a Lektor Static Site
description: How to deploy a Lektor static site with Bitbucket.
layout: post
comments: true
date: 2016-04-12
slug: lektor-static-site
tags: lektor, static site generator, flat files
---

<div style="text-align: center; margin-bottom: 20px;">
<img src="//www.aerobatic.com/media/logos/lektor-logo.png" style=" max-width: 100%;">
</div>

[Lektor](https://www.getlektor.com/) is a Python-based static content management system that outputs 100% static HTML. In this post, we'll deploy our first Lektor site to Aerobatic.

## Getting Started

Before installing Lektor, you'll first need to make sure you have Python 2.7 installed and ImageMagick. The [Lektor site](https://www.getlektor.com/docs/installation/) has more details on installation requirements.

Assuming you have those pre-requisites, you can go ahead and install Lektor to your machine:

~~~bash
curl -sf https://www.getlektor.com/install.sh | sh
~~~

## Create and build a Lektor site

In this demo, we'll build a sample site as follows:

~~~bash
lektor quickstart
cd yourproject
lektor build --output-path build
~~~

This will take the demo site and create the static assets in the `/yourproject/build` directory

## Create repo

We're now ready to create a git repository and push our site to Bitbucket:

~~~bash
# initialize new git repository
git init

# commit and push code to master branch
git commit -a -m "Initial commit"
git remote add origin git@bitbucket.org:YourUsername/site-name.git
git push -u origin master
~~~

Your Bitbucket respository should now look similar to this:

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/lektor-repo.png" alt="Lektor repo screenshot">

## Create website

Now that we've pushed our code to Bitbucket, we can then create our website. We'll assume you've already [installed the Aerobatic add-on](/docs/getting-started) for Bitbucket. So, in Aerobatic, go ahead and create your site:

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/create-lektor-site.png" alt="Lektor create website screenshot">

Note that our deployment directory is the `/build` directory where we placed all the static HTML assets.

And that's it! Our site is now live:

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/lektor-demo.png" alt="Lektor demo site screenshot">

## Summary

If you haven't hosted your sites before with Bitbucket and Aerobatic, it's easy to [get started](/docs/getting-started). We'll have your site live in less than a minute.

Here's a link to the [demo repo](https://bitbucket.org/dundonian/lektor-demo), that we referenced in this tutorial.
