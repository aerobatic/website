---
title: Host Slide Shows Online with Reveal.js and Aerobatic
subtitle: Create cross-platform, HTML and CSS Slide Shows with Hosting
description: Let your presentation's attendees see your slides online &mdash; by hosting Reveal.js slide shows on Aerobatic
slug: reveal-js-slide-show
comments: true
date: 2015-11-09
tags: static, slides, revealjs, presentations
---
You are about to present your talk in front of a large audience, and everything is going wrong:

- The room is not dark enough to see your slides
- The projector doesn't work and you need a PDF handout
- You want to support an audience member that needs a screen reader
- You hate live-coding and want to easily embed syntax highlighted code samples and terminal GIFs
- You want to take notes from the group on the fly with Markdown
- You suck at PowerPoint but still want to look fresh and dynamic

These might not happen all at once. But there is one slide show system
that can help with it all: [RevealJS](https://github.com/hakimel/reveal.js).

Many web developers shudder at the thought of opening up PowerPoint or Keynote. Why not use the technologies you already know to create slides: HTML, CSS, and JS. But don't do it
from scratch, use a helpful, small framework to get a head start.

Because Reveal creates a static web site for you, it's perfect for hosting on Aerobatic.

_Let's get started&hellip;_

## Install RevealJS

You can do either the Basic Setup or Full Setup from the [README](https://github.com/hakimel/reveal.js#installation).

I usually do the full setup, because it's not much longer to do, and gives me more features.

If you already have NodeJS and Grunt installed, here's a short cut for the full setup:

~~~sh
$ git clone  https://github.com/hakimel/reveal.js.git && cd reveal.js && npm install
~~~

## Create your slides

Just edit index.html. It's full of helpful examples. I also find that writing slides in [Markdown](https://github.com/hakimel/reveal.js#markdown) is super fast.

## Commit your changes with Git

If you just downloaded a release, run `git init` and `git commit` to create your first commit. Or, just use a nice GUI: [SourceTree](https://www.sourcetreeapp.com) app.

If you did the full setup, you'll need to add a new git remote to push your slides to.

Set up a new repository on [Bitbucket](https://bitbucket.org/repo/create?owner=new)

__Dont' have Aerobatic installed yet?__ [Get Started](http://www.aerobatic.com/splash/).

To add a new remote, and set it up as the default, do this:

~~~sh
$ git remote add bb git@bitbucket.org:USERNAME/REPONAME.git
$ git push -u bb master
~~~

You can also find these instructions in your empty Bitbucket repo. It's under 'I have an existing project'

## Connect Aerobatic to your Repo

Just look for the Aerobatic icon in the bottom left menu. Accept the defaults on the short form to deploy your slides.

![animation](/img/revealjs/gitpush.gif)

The only thing that you might have to change is the app name, which has to be unique in relation to all Aerobatic sites.

**That's it. You are done!**

## Demo App

Our demo app code is [here](https://bitbucket.org/aerobatic/revealjs)

And our slide show is [here](http://reveal-demo.aerobaticapp.com)
