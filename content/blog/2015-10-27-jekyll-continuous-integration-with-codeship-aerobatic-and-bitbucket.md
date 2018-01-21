---
title: Jekyll Continuous Integration With Codeship And Bitbucket
subtitle: How to build a continuous integration pipeline for a Jekyll static site
description: How to build a continuous integration pipeline for a Jekyll static site using Codeship for CI, Bitbucket for code hosting, and Aerobatic for hosting the static site.
slug: jekyll-continuous-integration-with-codeship-aerobatic-and-bitbucket
comments: true
date: 2015-10-27
tags: continuous integration, static hosting, jekyll
---

{% alert warning %}
**UPDATE:** Aerobatic now has [built-in support](/blog/automated-continuous-deployment-of-jekyll-sites) for building Jekyll sites. You no longer need to rely upon an external CI service for this. However, this article is still valid for other static site generators.
{% endalert %}

[Codeship](https://codeship.com) is a popular Continuous Deployment (CD) tool that integrates nicely with Bitbucket, and [Jekyll](http://jekyllrb.com) is a static site generator. In fact, this site is built with Jekyll. Frequently, Jekyll users will deploy their site to Github Pages. In this post, we'll show you how to build your Jekyll site with Codeship and deploy to Bitbucket, with Aerobatic hosting the resultant static site.

In doing so, Codeship will take your Jekyll markdown files, generate your static assets, push them to Bitbucket, and Aerobatic will automatically update your hosted site. The benefit to this kind of flow is that you don't need to generate the static content locally. In fact, you can then get in the habit of editing markdown files in Bitbucket directly, and everything else will happen automatically.

## Step 1: Create a Jekyll site
You can download one of the many [Jekyll themes](http://jekyllthemes.org/) and follow their [quick start guide](http://jekyllrb.com/docs/quickstart/) or one of our previous [blog posts](migrate-a-blog-from-wordpress-to-jekyll-and-host-it-on-bitbucket.html) on Jekyll.

In our case, we are not going to build the site locally, so in the `.gitignore` file, if it isn't already, add `_site`. This tells git not to push the `_site` folder to your hosted repo.

## Step 2: Set up a Bitbucket repository

1. Push your Jekyll site to Bitbucket, either from the command line, or using a tool like [Sourcetree](https://www.sourcetreeapp.com/).

2. Create a new branch - in this demo, we're calling our branch **aerobatic** but you can call it whatever you want. This will be the branch that we have Codeship push the built assets to and have Aerobatic host our site.

## Step 3: Set up Codeship

1. Create a new Codeship project and select the repo on Bitbucket that you just pushed.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/codeship1.png" alt="Screenshot of setting up a Codeship repository">

2. In the Setup Commands section, select Ruby as your language.

3. Remove the auto-generated commands in the **Test Commands** section

4. Save your changes

  <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/codeship2.png" alt="Screenshot of setting up a Codeship test commands">

5. Create your deployment commands

    We're going to use a Rakefile to instruct Codeship how to build and publish. So, in your deployment command section, select **master** as the branch to trigger the build and enter the following in the **custom scripts** section:

    <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/codeship3.png" alt="Screenshot of setting up a Codeship deployment commands">

## Step 4: SSH Keys

By default, when you link your Bitbucket repository to Codeship, it will automatically place a SSH key in the deployment keys section of your repo. However, this key is read-only, and you need to enable Codeship to also push to your repository. We're going to delete that read-only key and create a new one at the account level that can also push to your repository.

1. Delete the repository Deployment Key

    <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/repo-ssh.png" alt="Screenshot of repository deployment key">

2. Copy the Codeship SSH Public Key

    <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/codeship-ssh.png" alt="Screenshot of repository deployment key">

3.  Create an account level SSH Key

    <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/acct-ssh.png" alt="Screenshot of repository deployment key">

## Step 5: Create a Rakefile

1.  The Rakefile will be pushed to our repository, and this will tell Codeship how to build and publish the Jekyll site. Replace the repository details with your own:

    ~~~ruby
    require 'tmpdir'

    desc "Generate jekyll site"
    task :generate do
      puts "## Generating Site with Jekyll"
      system "jekyll build"
    end

    desc "Generate and publish blog to Bitbucket"
    task :publish do
      Dir.mktmpdir do |tmp|
        system "mv _site/* #{tmp}"
        system "git checkout -b aerobatic"
        system "rm -rf *"
        system "mv #{tmp}/* ."
        system 'git config --global user.email "jason@aerobatic.com"'
        system 'git config --global user.name "Jason Gowans - Codeship"'
        system "git add ."
        system "git commit -am 'Codeship Update'"
        system "git remote add bb git@bitbucket.org:dundonian/jekyll-codeship.git"
        system "git push -f bb aerobatic"
      end
    end
    ~~~

2. Push your Rakefile to Bitbucket. Once you push your changes, your Codeship build will kick-off automatically.

    <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/codeship-success.png" alt="Screenshot of successful Codeship build and deploy">



## Step 6: Link The Repo to Aerobatic
Now that we have Codeship set up, we can now git push our markdown files to the master branch and Codeship will deploy our static assets to the aerobatic branch.

To host the static website, we now just need to link the aerobatic branch to Aerobatic, assuming you've already installed the [Aerobatic add-on](https://bitbucket.org/account/addon-directory/) for Bitbucket.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/codeship/link-repo.png">

## Conclusion
Phew, you're now done! Thankfully, all of this was a series of one-time steps. From now on, you can just push markdown files to the master branch and everything else will happen automatically. You can even just create your markdown blog posts directly in the Bitbucket UI.

#### Demo App
The demo app is live on Aerobatic at [http://jekyll-codeship.aerobaticapp.com/](http://jekyll-codeship.aerobaticapp.com/).
