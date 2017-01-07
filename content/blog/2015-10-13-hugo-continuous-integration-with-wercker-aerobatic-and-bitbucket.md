---
title: Hugo Continuous Integration With Wercker And Bitbucket
subtitle: How to build a continuous integration pipeline for a Hugo static site
description: How to build a continuous integration pipeline for a Hugo static site using Wercker for CI, Bitbucket for code hosting, and Aerobatic for hosting the static site.
slug: hugo-continuous-integration-with-wercker-aerobatic-and-bitbucket
comments: true
date: 2015-10-13
tags: continuous integration
---

{% alert warning %}
**UPDATE:** Aerobatic now has [built-in support](/blog/easy-hugo-continuous-deployment) for building Hugo sites. You no longer need to rely upon an external CI service for this.
{% endalert %}

[Hugo](http://gohugo.io/) is a slick static site generator built in Go, and is viewed by many developers as a better alternative to Jekyll. [Wercker](http://wercker.com/) is a docker-based continuous integration (CI) tool that integrates nicely with [Bitbucket](https://bitbucket.org/). And [Aerobatic](http://www.aerobatic.com/), of course, is a static-hosting solution that integrates with Bitbucket via an add-on.

In this tutorial, we'll show you how to create your first Hugo blog site, host your repo on Bitbucket, hook it up to Wercker for continuous deployment, and then host the resultant static site on Aerobatic.

In doing so, Wercker will take your Hugo markdown files, generate your static assets, push them to Bitbucket, and Aerobatic will automatically update your hosted site. The big benefit to this kind of flow is that you don't need to generate the static content locally. So, you can actually then just get in the flow of pushing only the markdown files to Bitbucket and everything else will happen automatically. Cool, right?

## Create your first Hugo site
The main Hugo site has a great [quickstart guide](http://gohugo.io/overview/quickstart/). Below are the abbreviated steps for convenience, but you may want to head over there first for a more comprehensive guide.

#### Step 1: Install Hugo
~~~sh
$ brew install hugo
~~~

#### Step 2: Create new site
~~~sh
$ hugo new site hugo-demo
$ cd hugo-demo
~~~

#### Step 3: Create new blog post
~~~sh
$ hugo new post/first.md
~~~

A file has now been created in `/content` with the following contents. Note that when you want to publish this, you'll set `draft = false`.

~~~html
+++
+++
date = "2015-01-08T08:36:54-07:00"
draft = true
title = "about"
+++
~~~

#### Step 3: Install a theme
Hugo comes with a fairly [extensive library](https://gohugo.io/themes/overview/) of themes. You can choose to install all of them and then pick and choose, or just install one. Here, we'll install all the available themes.

~~~sh
$ git clone --recursive https://github.com/spf13/hugoThemes themes
~~~

#### Step 4: Run Hugo
~~~sh
$ hugo server -t hugo-theme-air --buildDrafts --watch
~~~

At this point, we could just push the whole site and link the static contents in the `public` folder to Aerobatic for website hosting. However, out goal in this case is to offload the build and deploy step to Wercker so that all we need to think about is authoring markdown. So...

## Set Up A Bitbucket Git Repository
You've now got your first Hugo site built and running locally. Now, we want to set up a Bitbucket repo to host our Hugo code.

#### Step 1: Initialize our repo
~~~sh
$ git init
~~~

#### Step 2: Ignore some folders and keep others
Since we're going to have Wercker do the Hugo build for us, we don't need to push the `/public` or `/themes` folders to Bitbucket. To do this, create a `.gitignore` file in the root of your repo with the following contents:

~~~sh
public
themes
~~~

Also, the `/static` folder is empty, but Wercker will still need it during the build process. To make sure it gets pushed to Bitbucket, simply add an empty `.gitkeep` file to the `/static` folder.

#### Step 3: Add, Commit, and Push Your Code
Either from the command line, or using a tool like SourceTree, go ahead and create a local and remote repository for your new `hugo-demo` site

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/hugo-sourcetree.png">

#### Step 4: Create a new orphan branch
With our `hugo-demo` site pushed to Bitbucket, we have one other thing to do. Our master branch will contain our markdown files, and we will create another branch that will contain our built assets that Wercker will generate.

This Wercker [tutorial for Github Pages](https://gohugo.io/tutorials/github-pages-blog/) does a good job of explaining the Git flow, and we'll be following a similar path for our Bitbucket repo:

~~~bash
# Create a new orphan branch (no commit history) named public
git checkout --orphan public

# Unstage all files
git rm --cached $(git ls-files)

# Grab one file from the master branch so we can make a commit
git checkout master README.md

# Add and commit that file
git add README.md
git commit -m "INIT: initial commit on public branch"

# Push to remote public branch
git push origin public
~~~

At this point, we have our `hugo-demo` Bitbucket repository with a `master` branch and a `public` branch. The `master` branch contains everything except the statically generated `public` folder and the `themes` folder. Our `public` branch has only a `README.md` file.

## Wercker Continuous Integration
There are lots of CI tools out there, but we selected Wercker for this tutorial because, a) it integrates nicely with Bitbucket and Hugo, b) it has a nice library of community-contributed pre-built steps in its registry, and c) it has a free tier for trying it out.

One bonus is that there's an active [Wercker Slack channel](https://werckerpublic.slack.com) where members will readily volunteer to help troubleshoot problems. Really loved the community response there.

#### Step 1: Link Your Repo to Wercker
You'll need to create a Wercker account and connect with Bitbucket. Rather than spell out all the details here, head on over to [Wercker](http://wercker.com/) and get started there. They have a really nice on-boarding flow:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/wercker-setup.png">

#### Step 2: Create a wercker.yml
Wercker, and most any CI tool, typically uses a `.yml` file that outlines the steps in your build process. Here, we'll create a `wercker.yml` file and store it in the root of our `hugo-demo` repository.

Here's what our `.wercker.yml` looks like:

~~~yaml
box: debian
build:
  steps:
    - script:
        name: install git
        code: |
          apt-get update
          apt-get -y install git
    - script:
        name: download theme
        code: |
          git clone https://github.com/vjeantet/hugo-theme-casper themes/casper
          rm -rf themes/casper/.git
    - arjen/hugo-build:
        version: "0.15"
        theme: casper
    - script:
        name: copy output directory
        code: |
          cp * -R $WERCKER_OUTPUT_DIR
deploy:
  steps:
    - script:
        name: install git
        code: |
          apt-get update
          apt-get -y install git
    # Add SSH-Key to
    - leipert/add-ssh-key-gh-bb:
        keyname: DEPLOY_SSH
    # Add bitbucket to known hosts, so they won't ask us whether we trust bitbucket
    - add-to-known_hosts:
        hostname: bitbucket.org
        fingerprint: 97:8c:1b:f2:6f:14:6b:5c:3b:ec:aa:46:46:74:7c:40
    - leipert/git-push:
         host: bitbucket.org
         repo: dundonian/hugo-demo
         branch: public
         basedir: public
~~~

You'll obviously update the `repo` field to match the name of the repo you created in Bitbucket. There is one other thing in there though that we still have to take care of. You may have noticed that the `keyname` field has an environment variable value called `DEPLOY_SSH`.

#### Step 3: Set Up SSH Keys
In Wercker, create a new SSH Key pair. Copy the public key in Wercker and then add that to your Bitbucket account SSH Keys.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/ssh-key.png">

#### Step 4: Create Wercker Environment Variable
Using the SSH key that we just created, create a new environment variable in Wercker and name it `DEPLOY_SSH`

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/wercker-env-var.png">

#### Step 5: Create Wercker Deploy Target
The final step in Wercker is to create a deploy target that references our environment variable.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/deploy-target.png">

## Link The Repo to Aerobatic
Now that we have Wercker set up, we can now git push our markdown files to the master branch and Wercker will deploy our static assets to the public branch.

To host the static website, we now just need to link the public branch to Aerobatic, assuming you've already installed the [Aerobatic add-on](https://bitbucket.org/account/addon-directory/) for Bitbucket.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/link-repo.png">

## Conclusion
Phew, you're now done! Thankfully, all of this was a series of one-time steps. From now on, you can just push markdown files to the master branch and everything else will happen automatically. You can even just create your markdown blog posts directly in the Bitbucket UI like this:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/bb-blog-post.png">

#### Demo App
The demo app is live on Aerobatic at [http://hugo-demo.aerobatic.io/](http://hugo-demo.aerobatic.io/) and the code is on [Bitbucket](https://bitbucket.org/dundonian/hugo-demo/src).
