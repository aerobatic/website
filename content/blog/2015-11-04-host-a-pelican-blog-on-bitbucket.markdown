---
title: Host a Pelican Blog on Bitbucket
subtitle: How to host a Pelican static site with Bitbucket and Aerobatic
description: How to host a Pelican static site with Bitbucket and Aerobatic
slug: host-a-pelican-blog-on-bitbucket
comments: true
date: 2015-11-04
tags:
- static generator
---
[Pelican](http://docs.getpelican.com/en/3.6.3/) is a static site generator written in Python. In this tutorial, we'll show you how to build your first Pelican site, host the repo with Bitbucket, and deploy the site to Aerobatic.

### Step 1: Install Pelican
pip is a package management system used to install and manage software packages written in Python. If you don't have pip on your machine, you'll first need to [install it](http://pip.readthedocs.org/en/stable/installing/).

Once you have pip, install Pelican:

~~~sh
pip install pelican markdown
~~~

### Step 2: Create a Pelican site

~~~sh
mkdir -p ~/projects/yoursite
cd ~/projects/yoursite
pelican-quickstart
~~~

At this point, you'll be asked a series of questions:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/pelican/pelican-quickstart.png" alt="Screenshot of Pelican static generator quickstart process">

### Step 3: Create a post

In your text editor, create your first post:

~~~sh
Title: My First Pelican Post
Date: 2015-11-04
Category: Review

Aerobatic kicks butt.
~~~

Save it in the `~/projects/yoursite/content/` directory.

### Step 4: Generate content

From the root directory of your Pelican site, run:

~~~sh
pelican content
~~~

Your site has now been generated in the `~/projects/yoursite/output/` directory.

You can get fancy and customize your site with a [Pelican theme](http://www.pelicanthemes.com/) if you wish, but at this point, your site is ready to host with Aerobatic...

### Step 5: Create a Bitbucket repo
Either using a tool like [Sourcetree](https://www.sourcetreeapp.com/) or from the command line, go ahead and upload your Pelican site into Bitbucket.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/pelican/pelican-sourcetree.png" alt="Screenshot of Pelican site being uploaded to Bitbucket with Sourcetree">

In this tutorial, we're going to keep things simple and upload the whole site into a single master branch, but a common pattern might be to create a separate orphan branch for your **output** directory and keep it separate from the rest of the Pelican code. If you're interested, we previously covered orphan branches in our [Hugo blog post](hugo-continuous-integration-with-wercker-aerobatic-and-bitbucket.html).

### Step 6: Deploy with Aerobatic
Deploying your Pelican site is as simple as [installing](/splash/) the Aerobatic add-on in Bitbucket (a one-time step) and then linking your repo to Aerobatic. Then, with each subsequent `git push` to Bitbucket, Aerobatic will deploy a new version of your site.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/pelican/pelican-aerobatic.png" alt="Screenshot of Pelican static site being deployed to Aerobatic">

Make sure that you specify the deployment directory as `/output` and if you're ready to deploy, check the **Yes, deploy my site now!** option.

Once you click the button, your site will be live in ~15 seconds, complete with CDN deployment and https. To learn more about other Aerobatic features you can add to your Pelican site, check out our [docs](/docs/) section.

#### Demo App
The demo app is live on Aerobatic at [https://pelican-demo.aerobaticapp.com/](https://pelican-demo.aerobaticapp.com/).
