---
title: How to host your static web site with HexoJS
subtitle:
slug: how-to-host-your-static-web-site-with-hexo-js
comments: true
description: Easy static web site hosting, with Hexo, a JavaScript based site generator
tags: hexo, javascript, bitbucket, blogs
---

Hexo is a fast, simple & powerful blog framework. It's written in JavaScript and easy to install. It has markdown support and an active plugin ecosystem. If you're considering a static site generator, it is an alternative to Jekyll that does not depend on Ruby.

## Installation
Assuming you have [NodeJS](http://nodejs.org) already installed, you can simply:
`npm -g install hexo-cli`

## Starting a new blog
Navigate to the directory above where you'd like to create your blog and type:

~~~sh
hexo init blog
~~~

You can replace `blog` with whatever you like. Now, follow the commands below. It will install all the dependences that Hexo needs and start a local server.

~~~sh
cd blog
npm install
hexo server
~~~

You may see a warning about an optional dependency `fsevents` failing to install. It's o.k. to ignore that. You may also see errors about `DTraceProviderBingings...MODULE_NOT_FOUND`. That's o.k. too.

After `hexo server` starts, you should see:
`INFO Hexo is running at http://0.0.0.0:4000/. Press Ctrl+C to stop`.

When you've launched your browser, you should see something like this:

<img alt="screenshot" class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hexo/hexo-install-page.png">

## Generate your site
Now it's time to generate the static files:

~~~sh
hexo generate
~~~

This creates a folder called `public`, but don't worry, `hexo deploy` will put that on a separate branch automatically for us.

## Check it all in to git

~~~sh
git init
git add .
git commit -m 'initial commit of blog'
~~~

## Add Bitbucket as a remote
Click on [Create New Repository](https://bitbucket.org/repo/create)
and create a new repo on bitbucket.

Click on Command line and follow the the instructions for "I have an existing project". Basically you are doing:

~~~sh
git remote add origin git@bitbucket.org:BITBUCKET-USERNAME/REPONAME.git
~~~

You need to replace `BITBUCKET-USERNAME` with your bitbucket username and `REPONAME` with the name of your repo that you created.

## Deploy your site via Aerobatic

Before we start, you have to modify settings in the `_config.yml` file. We are deploying with git, so that is the type. For example:

~~~yaml
deploy:
  type: git
  repo: git@bitbucket.org:BITBUCKET-USERNAME/REPONAME.git
  branch: aerobatic
~~~

Now, install the git deployment plugin:  [hexo-deployer-git](https://github.com/hexojs/hexo-deployer-git).

~~~sh
$ npm install hexo-deployer-git --save
~~~

## Link the Aerobatic plugin to your aerobatic branch

Now all that is left is to link the Aerobatic plugin on Bitbucket to the `aerobatic` branch that hexo created for us with `hexo deploy`

<img alt="screenshot plugin" class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hexo/link-repo-aerobatic.png">

## Voilà! Your site is hosted!

<img alt="screenshot deploying" class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hexo/hexo-deployed.png">

and

<img alt="screenshot done" class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hexo/hexo-done.png">

Our example code is hosted [on Bitbucket here](https://bitbucket.org/aerobatic/hexo-test/).
