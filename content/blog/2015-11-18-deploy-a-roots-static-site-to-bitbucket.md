---
title: Deploy a Roots Static Site to Bitbucket
description: How to deploy a Roots static site to Bitbucket using Aerobatic.
slug: deploy-a-roots-static-site-to-bitbucket
comments: true
date: 2015-11-18
tags: static generator, rootscd
---

[Roots](http://roots.cx/) is a static site generator that's sponsored by the digital agency, [Carrot Creative](http://carrot.is/). Whereas Jekyll is built with Ruby and Hugo is built with Go, Roots is built with NodeJS and comes with support for the [Jade](http://jade-lang.com/) template engine out of the box.

In this post, we'll show you how to build your first Roots static site and deploy it to Aerobatic using Bitbucket.

## 1) Install roots

{% highlight bash linenos %}
npm i roots -g
{% endhighlight %}

## 2) Create new project

Replace `roots-demo` with whatever you want to call your project. The

{% highlight bash linenos %}
roots new roots-demo
{% endhighlight %}

## 3) Build your site

{% highlight bash linenos %}
cd roots-demo
roots watch
{% endhighlight %}

Your site will now be live at `http://localhost:1111/` and your site's directory structure will look something like:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/rootscx/roots-directory.png" alt="Screenshot of roots directory structure">

## 4) Add repo to Bitbucket
Before pushing your site to Bitbucket, you'll first need to comment out or remove `public` from your `.gitignore` file. This is where your compiled assets are.

Once you've done that, go ahead and push this repo to Bitbucket either from the command line or using a tool like [Sourcetree](https://www.sourcetreeapp.com/).

## 5) Deploy site to Aerobatic

Assuming you've already [installed](/splash) the Aerobatic add-on for Bitbucket, go ahead and link your Roots repo to Aerobatic like so:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/rootscx/link-repo.png" alt="Screenshot of deploying a roots site to Aerobatic">

## Summary

Your first roots site is now live. From here, you can add a [custom domain](/docs) and SSL cert with Aerobatic. If you want to dig into some of the more advanced features of roots, you can go through the roots [documentation](http://roots.cx/docs).
