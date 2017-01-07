---
title: Hakyll, a static site generator in Haskell
subtitle:
slug: hakyll-a-haskell-static-site-generator
comments: true
description: Love functional programming? Want to get started with Haskell? Try out Hakyll, a static site generator.

tags: haskell, hekyll, bitbucket, blogs
---

[Hakyll](http://jaspervdj.be/hakyll/) is a Haskell tool for generating static sites, mostly aimed at small-to-medium sites and personal blogs. It is highly configurable, with its own Domain Specific Language. If you need something more than Markdown support, say, TeX, or need to write your own compilation rules, it's a powerful tool.

## Installation
Assuming you have [Haskell](https://github.com/commercialhaskell/stack#the-haskell-tool-stack) already installed, you can type:

~~~sh
$ cabal update
$ cabal install -j hakyll
~~~

## Starting a new blog
Navigate to the directory above where you'd like to create your blog and run:

~~~sh
$ hakyll-init blog
~~~

You can replace `blog` with whatever you like.

If you run into errors, see [this more detailed post on installing Hakyll](http://jaspervdj.be/hakyll/tutorials/01-installation.html)

## Generating the site

The file `site.hs` holds the configuration of your site, as an executable
Haskell program. We can compile and run it like this:

~~~sh
$ cd blog
$ ghc --make -threaded site.hs
~~~

You've now made an executable called 'site' in your current directory. You can
now use the `build` and `watch` commands for that executable.

~~~sh
$ ./site build
~~~

The command above made a directory called `_site` that holds the HTML, CSS, and other site files you can publish.

And to see your site, now you can:

~~~sh
$ ./site watch
~~~

which will start a server.  Have a look at your site at
[http://127.0.0.1:8000/](http://127.0.0.1:8000/).

When you've launched your browser you should see something like this:

<img alt="screenshot" class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hakyll/hakyll-default-page.png">


## Check it all in to git

First, add a few things to a new `.gitignore` file:

~~~
_cache
site
site.hi
site.o
~~~

Then, you can check in your code and commit it:

~~~sh
$ git init
$ git add .
$ git commit -m 'initial commit of blog'
~~~

## Add Bitbucket as a remote
Click on [Create New Repository](https://bitbucket.org/repo/create)
and create a new repo on bitbucket.

Click on Command line and follow the the instructions for "I have an existing project" Basically you are doing:

~~~sh
$ git remote add origin $ git@bitbucket.org:BITBUCKET-USERNAME/REPONAME.git
~~~

You need to replace `BITBUCKET-USERNAME` with your bitbucket username and `REPONAME` with the name of your repo that you created.

If you don't have the Aerobatic plug-in installed yet, go to the [Add-on Directory](https://bitbucket.org/account/addon-directory/) and install Aerobatic.

## Deploy your site via Aerobatic

Deploying your site via Aerobatic as is a simple as setting up the plugin to point to the `_site` directory.

<img alt="screenshot plugin" class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hakyll/hakyll-link-repo-aerobatic.png">

## Hooray for Haskell! Your site is hosted!

<img alt="screenshot done" class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hakyll/hakyll-done.png">

Click on "Launch Website" to view your site.
Our example code is hosted [on Bitbucket here](https://bitbucket.org/aerobatic/hakyll-demo/).
