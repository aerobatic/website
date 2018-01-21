---
title: How To Set Up Continuous Integration For A ReactJS App
subtitle: How to build a continuous integration pipeline for a ReactJS web app with Gulp, Wercker, Bitbucket, and Aerobatic
description: How to build a continuous integration pipeline for a ReactJS app using Gulp to build and test your app, Wercker for CI, Bitbucket for code hosting, and Aerobatic for hosting the static site.
slug: reactjs-continuous-integration
comments: true
date: 2015-10-30
tags:
- continuous integration
---
[ReactJS](https://facebook.github.io/react/) is a JavaScript library for building user interfaces, typically used in the context of building modern Single Page Apps. Sometimes, when we talk about static hosting, we tend to think only of website generators like Jekyll or Hugo, but web apps built with ReactJS are also great for hosting with Aerobatic, since their output is typically HTML, CSS, and JavaScript i.e. static assets.

In this tutorial, we'll take the [React-Starterify](https://github.com/Granze/react-starterify) app, clone the repo in Bitbucket, hook it up to [Wercker](http://wercker.com/) for continuous deployment, and then host the compiled assets on Aerobatic.

In doing so, Wercker will take React-Starterify app, `npm install` the dependencies, run the tests and build steps specified in the gulp file, push the static assets to Bitbucket, and Aerobatic will automatically update your hosted web app.

## Set up git

#### Step 1: Import repo to Bitbucket

* Head over to [https://bitbucket.org/repo/import](https://bitbucket.org/repo/import)
* In the URL input, paste in the Github repo details: `https://github.com/Granze/react-starterify.git`

#### Step 2: Clone repo locally

Either from the command line, or using a tool like SourceTree, go ahead and clone the Bitbucket repo that you just created, onto your local development machine.

~~~sh
$ git clone git@bitbucket.org:youraccountname/react-starterify.git
~~~

#### Step 3: Create a new branch
This will be the branch that we deploy our compiled assets to. When Wercker does our gulp build task, it will deploy the compiled assets to this dist branch that will eventually be linked to Aerobatic for hosting.

~~~bash
# Create a new orphan branch (no commit history) named dist
git checkout --orphan dist

# Unstage all files
git rm --cached $(git ls-files)

# Grab one file from the master branch so we can make a commit
git checkout master README.md

# Add and commit that file
git add README.md
git commit -m "INIT: initial commit on dist branch"

# Push to remote dist branch
git push origin dist
~~~

At this point, we have our **react-starterify** Bitbucket repository with a **master** branch and a **dist** branch. The **master** branch contains our source code and our **dist** branch has only a **README.md** file for now.

## Set up Wercker

We previously used Wercker to build a [Hugo static blog](/hugo-continuous-integration-with-wercker-aerobatic-and-bitbucket.html), and it was such an easy experience, we're going to use it again for this tutorial.

#### Step 1: Link Your Repo to Wercker
You'll need to create a Wercker account and connect with Bitbucket. Rather than spell out all the details here, head on over to [Wercker](http://wercker.com/) and get started there. They have a really nice on-boarding flow:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/hugo/wercker-setup.png" alt="Screenshot of Wercker onboarding process">

#### Step 2: Create a wercker.yml
Wercker uses a `.yml` file that outlines the steps in your build process. Below is our `wercker.yml` file that we will store in the root of our **react-starterify** repository.

~~~yaml
box: node

build:
  steps:
    - npm-install
    - hgen/gulp:
        tasks: build

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
         repo: dundonian/react-starterify
         branch: dist
         basedir: dist
~~~

You'll update the `repo` field to match the name of the repo you created in Bitbucket. You may have noticed that the `keyname` field has an environment variable value called `DEPLOY_SSH`.

#### Step 3: Set Up SSH Keys
In Wercker, create a new SSH Key pair. Copy the public key in Wercker and then add that to your Bitbucket account SSH Keys.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/react-starterify/ssh-wercker.png" alt="Screenshot of getting SSH keys in Wercker">

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/react-starterify/ssh-bb.png" alt="Screenshot of setting up SSH keys in Bitbucket">



#### Step 4: Create Wercker Environment Variable
Using the SSH key that we just created, create a new environment variable in Wercker and name it `DEPLOY_SSH`

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/react-starterify/wercker-env-var.png" alt="Screenshot of setting up an environment variable in Wercker">


#### Step 5: Create Wercker Deploy Target
The final step in Wercker is to create a deploy target.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/react-starterify/wercker-deploy-target.png" alt="Screenshot of setting up a deploy target in Wercker">

## Link The Repo to Aerobatic
With Wercker set up to run our gulp tests and build, we can now git push to the master branch and Wercker will deploy our successfully compiled assets to the **dist** branch.

To host the static website, we now just need to link the **dist** branch to Aerobatic, assuming you've already installed the [Aerobatic add-on](https://bitbucket.org/account/addon-directory/) for Bitbucket. Make sure you also check the **Yes, deploy my site now!** option.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/react-starterify/link-repo.png" alt="Screenshot of linking a repo to Aerobatic for static hosting">

After ~15 seconds, your app will be live to the public!

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/react-starterify/app-deployed.png" alt="Screenshot of a live static website version in Aerobatic">

#### Demo App
The demo app is live on Aerobatic at [http://react-starterify.aerobaticapp.com/](http://react-starterify.aerobaticapp.com/).

## Next Steps
Often, with Single Page Apps, our front-end is calling APIs. The [Aerobatic API proxy](/docs/#sec5) makes many of those operations easier and more efficient for developers.
