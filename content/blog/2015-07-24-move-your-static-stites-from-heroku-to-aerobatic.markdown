---
title: Move Your Static Sites From Heroku to Aerobatic
subtitle:  Heroku is killing the free 24/7 hosting option. But there's a better choice for static sites anyway.
layout: post
comments: true
date: 2015-07-24
slug: move-your-static-stites-from-heroku-to-aerobatic
description: How to move your static site from Github to Bitbucket, and Heroku to Aerobatic.
tags:
---

*This post originally appeared on [Ivan Storck's blog](http://blog.ivanstorck.com/move-your-static-sites-from-heroku-to-aerobatic/) and is reposted here. Ivan is the Director of Developer Relations at Aerobatic.*

**Heroku has killed the free 24/7 hosting option.** So, you have to decide if having your site up 18 hours a day is acceptable (*Really? No*.) Or, find a different free host. If your site is all front-end code that runs in the browser, I have a great option for you. A lot of my hobby sites are like this, and I'm switching away from Heroku for all of these sites.

**[Aerobatic's bitbucket plugin](http://bitbucket.aerobatic.com) is an excellent solution for static web site hosting and git push deployment.**

I'll outline step-by-step instructions on how to get started. I'll also show how to move your code from Github to Bitbucket, because it has free private hosting. **Bitbucket has an easy integration with Aerobatic**.

Aerobatic has additional benefits beyond Heroku. Your site visitors will see your site faster. **Aerobatic includes a CDN**, so your assets are served minified, gzipped, and with cache headers from locations world-wide. Aerobatic also supports custom domian names, and SSL certificates.

Coming soon will be custom middleware options that power more advanced features: Authentication (logging in and out with OAuth services); Custom error pages for 404 pages; Redirects; [API proxying](/docs/plugins/http-proxy), Form processing / handling —for example contact forms, sending to webhooks, posting to Google Docs, Slack or HipChat, etc.

The whole idea behind Aerobatic is for front-end developers to be able to compose a web application without writing server side code and setting up a server.

**Let's get started!** It's just four main steps. If you already have your code on Bitbucket and want to skip ahead, go to [here](#install).


## Import a Repo

Visit [https://bitbucket.org/repo/import](https://bitbucket.org/repo/import)

(or type i, then r from your dashboard)

<img class="img-responsive" alt="bitbucket dashboard repositories menu, import" src="http://media.screensteps.me/sw/n7z7vh/import-a-repo.png?1434568984">

## Import from Github via Git

Even though there is an "Import from Github" in the sidebar, you may not want to use it. I have found that if you have a lot of repos, it won't show them all. It's more reliable to just grab the https URL from the Github page of your repo.

* Don't forget to check "Requires authorization" if your repo is not public on Github.
* Make sure make the owner of the repository your **team**, not** **your individual account.**


<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/import-from-github-via-git.png?1434568986">

## Importing repository — Bitbucket

You'll see a green check mark for success when Bitbuck is done importing your code.

<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/importing-repository--mdash--bitbucket.png?1434568987">

## Option A: Go to your Team page and install the Add-on

You may want to install the add-on for your team, or your individual account.

To install for your team, click on Manage Team. Or, skip this step and look at the individual step below

<img class="img-responsive" alt="screenshot" src=" http://media.screensteps.me/sw/n7z7vh/option-a--go-to-your-team-page-and-install-the-add-on.png?1434568989">

## Option B: Install the Add-On to Your Individual Bitbucket Account

Scroll down to the "Find Add-Ons" link on the left bottom of your account settings page.

<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/option-b--install-the-add-on-to-your-individual-bitbucket-account.png?1434568990">

## Install the Aerobatic Hosting Add-On

<img class="img-responsive" alt="screenshot"
src="http://media.screensteps.me/sw/n7z7vh/install-the-aerobatic-hosting-add-on.png?1434568991">

## Locate Your Site index.html

Before you publish your site, you'll need to remember where your home page is. This might be in a folder called _site, public, or dist, Or, it might be on a different branch called gh-pages.

<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/locate-your-site-indexhtml.png?1434568993">

## Link your Repo to Aerobatic

Choose where your index.html, or other home page is.

You may have to adjust the app name if it is already taken on Aerobatic.

<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/link-your-repo-to-aerobatic.png?1434568994">

## After linking your repo, you need to deploy

<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/after-linking-your-repo--you-need-to-deploy.png?1434568995">

## Clone the repo and push it back to Bitbucket

You can just do an empty commit if you have no changes to push.

It's just a one liner in Terminal:

     git commit -m 'empty commit' --allow-empty && git push

Coming soon will be the ability to automatically deploy the app from bitbucket, when you link it to Aerobatic.

<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/clone-the-repo-and-push-it-back-to-bitbucket.png?1434568996">

## Now your app is hosted on Aerobatic

Go back to your browser and refresh the Aerobatic hosting page. It should show at least one version of your app being deployed.

Check out the version URL column if you'd like to review the app, as it was, at a particular commit.

<img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/now-your-app-is-hosted-on-aerobatic.png?1434568997">

## Problem? Check Out the App Settings

Bitbucket add-on settings are towards the bottom of the repo settings page.

The most common problem will be that you didn't specify the correct location of where your index.html page is. For example, when I did this first I did not select '/public' as my directory, and left things on the master branch. This gave me a 404 when I first visited my app.

<img class="img-responsive" alt="screenshot"  src="http://media.screensteps.me/sw/n7z7vh/problem--check-out-the-app-settings.png?1434568999">

## You're done!

Go check out your app online!

Next step: setup a custom web address by pointing a CNAME for your domain name to your aerobatic app URL.

<a href="http://magnum-mania.com/Characters/Main_Characters.html#T.C."><img class="img-responsive" alt="screenshot" src="http://media.screensteps.me/sw/n7z7vh/you-re-done-.gif?1434569006"></a>
