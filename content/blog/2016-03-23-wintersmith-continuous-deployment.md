---
title: Cool Wintersmith Continuous Deployment
description: Autobuild and deploy Wintersmith static sites with Bitbucket.
slug: wintersmith-continuous-deployment
comments: true
date: 2016-03-23
tags: wintersmith, static site generator, cd, nodejs
---

<div style="text-align: center; margin-bottom: 20px;">
<img src="//www.aerobatic.com/media/logos/wintersmith-logo.svg" style=" max-width: 100%;">
</div>

[Wintersmith](http://wintersmith.io/) describes itself as a "flexible, minimalistic, multi-platform static site generator built on top of node.js." Aerobatic itself is built with node.js, so it's only natural that we'd extend our static site auto-build feature to node.js based generators. So, starting today, Aerobatic now builds, deploys, and hosts Wintersmith sites!

In addition to Wintersmith, we also auto-build [Hugo](easy-hugo-continuous-deployment) and [Jekyll](automated-continuous-deployment-of-jekyll-sites) sites.


## Getting Started

Wintersmith has a nice [quick start guide](https://github.com/jnordberg/wintersmith#quick-start) on its site. So, we'll just cover the basics in this post.

If you haven't already, go ahead and install Wintersmith on your machine and build a sample site:

~~~bash
npm install wintersmith -g
wintersmith new site-name
cd site-name
wintersmith preview
~~~

This will fire up your browser at `http://localhost:8080` and you can now start editing your site.

When you're ready, you can then enter `wintersmith build` to create your compiled static assets in a `/build` directory. However, because Aerobatic builds Wintersmith sites automatically, you don't need to do this step. In fact, we'll add the `/build` directory to a `.gitignore` file:

~~~json
/build
/node_modules
~~~

## Enabling Automated Builds

Next, we'll edit the Wintersmith `package.json` file to include the Aerobatic build information. Here's the snippet you'll add:

~~~json
{
  "_aerobatic": {
    "build": {
      "engine": "wintersmith"
    }
  }
}
~~~

If you're following the Wintersmith **getting started** tutorial, your entire `package.json` should now look as follows:

~~~json
{
  "dependencies": {
    "moment": "2.3.x",
    "underscore": "1.4.x",
    "typogr": "0.5.x"
  },
  "_aerobatic": {
    "build": {
      "engine": "wintersmith"
    }
  },
  "private": "true"
}
~~~

## Create repo

We're now ready to create a git repository and push it to Bitbucket:

~~~bash
# initialize new git repository
git init

# commit and push code to master branch
git commit -a -m "Initial commit"
git remote add origin git@bitbucket.org:YourUsername/site-name.git
git push -u origin master
~~~

Your Bitbucket respository should now look similar to this:

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/wintersmith-bitbucket.png" alt="Wintersmith repo screenshot">

## Create website

Now that we've pushed our code to Bitbucket, we can then create our website. We'll assume you've already [installed the Aerobatic add-on](/docs/getting-started) for Bitbucket. So, in Aerobatic, go ahead and create your site:

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/wintersmith-create-site.png" alt="Aerobatic create website screenshot">

Once you've done that, less than 20 seconds later, your site will be live, and you can even view the build log if you wish:

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/wintersmith-build-log.png" alt="Wintersmith build log screenshot">

## Editing in Bitbucket

One neat thing about Aerobatic auto-building Wintersmith sites is that you can now just author and edit posts directly in Bitbucket, make a commit, and Aerobatic will automatically deploy a new version of your Wintersmith site for you.

<img class="screenshot" src="//www.aerobatic.com/media/screenshots/wintersmith-editing.png" alt="Wintersmith edit in Bitbucket screenshot">

## Summary

If you haven't hosted your sites before with Bitbucket and Aerobatic, it's easy to [get started](/docs/getting-started). We'll have your site live in less than a minute.

Here's a link to the [demo repo](https://bitbucket.org/dundonian/wsmith-demo/src), that we referenced in this tutorial. Feel free to fork it!
