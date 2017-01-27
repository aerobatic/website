---
title: Announcing Aerobatic transition from Bitbucket
description: On March 1, 2017 Aerobatic will no longer function a Bitbucket add-on.
comments: true
date: 2017-01-24
tags: bitbucket, cli
slug: announcing-aerobatic-transition
---

{{% alert tip %}}
**TLDR;** Aerobatic is transitioning from a Bitbucket add-on to a standalone CLI and web dashboard. You can still auto-deploy your sites with each push using Bitbucket Pipelines. In order to maintain continuous deployment, be sure to migrate your sites by **March 1st 2017** when the Aerobatic Bitbucket add-on is retired. Your sites will continue to load fine after that date, even if you don't migrate, but you won't be able to deploy new versions.
{{% /alert %}}

Back in Spring of 2015, Aerobatic launched as one of the original partners in the Bitbucket add-on program &mdash; providing a seamless static website deployment experience directly from the Bitbucket interface. The add-on has been a terrific way to introduce ourselves to a great many developers who use Bitbucket as their source-control provider. However this has meant in order to take advantage of Aerobatic, one needed to be a user of Bitbucket. In order for us to serve the largest possible audience, we've determined that Aerobatic needs to be the best static hosting solution not only for Bitbucket, but GitHub, GitLab, on-premise VCS, or no source-control at all.

To achieve that objective, Aerobatic is transitioning from a Bitbucket add-on to a standalone interface &mdash; actually two interfaces: a [command line tool](/docs/cli) (CLI) called "aero" and a web dashboard at https://dashboard.aerobatic.com. It's important to convey that this is just a change in how you interact with Aerobatic. The underlying hosting infrastructure that you've come to know and trust remains largely unchanged (with a few enhancements discussed below).

### Bitbucket Pipelines

Because Aerobatic will no longer be tied into Bitbucket, we will no longer receive a webhook when you push to your repo, so it won't be Aerobatic that runs your build process anymore. But fear not, with Bitbucket Pipelines you'll still have the **same seamless continuous deployment workflow** that you're accustomed to.

[Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines) is a new CI/CD service from Atlassian that will automatically trigger a configurable build/deploy workflow when you push to your repo. Pipelines can easily be configured to build sites with all the same tools supported by Aerobatic including Jekyll, Hugo, Webpack, Middleman and so on. Because it's based on Docker, you have full control over what software is installed on the image &mdash; such as the specific version of Hugo. Your build config is specified in a file called [bitbucket-pipelines.yml](https://confluence.atlassian.com/bitbucket/configure-bitbucket-pipelines-yml-792298910.html) at the root of your repo.

If this all sounds a bit complicated, don't worry, our migration process will provide you the exact YAML contents for your website to copy and paste. This is generally a one time "set it and forget it" step.

To get a sense for what the `bitbucket-pipelines.yml` file looks like, here's a sample that builds a Jekyll site and deploys to Aerobatic:

~~~yaml
image: jekyll/jekyll                       # Use the jekyll image from Dockerhub
pipelines:
  branches:
    master:
      - step:
          script:
          - bundle install                 # Run bundler against the Gemfile
          - bundle exec jekyll build       # Build the site
          - npm install -g aerobatic-cli   # Install the aero CLI
          - aero deploy --directory _site  # Deploy the built site to Aerobatic
---
~~~

An environment variable named `AEROBATIC_API_KEY` must be defined with Pipelines. The migration instructions will provide your unique api key value.

### aerobatic.yml

With the Bitbucket add-on, there is a `_aerobatic` section to the `package.json` file where you specify a `router` array with any plugins such as `basic-auth`, `redirects`, `custom-errors`, etc. Now, we rely on a file called `aerobatic.yml` which has basically the same structure with a few naming tweaks. The only mandatory property in the file is `id` which is the unique ID of your website. The reasoning behind this change is that the YAML format is more conducive to comments than JSON and also more universal to all programming languages and development stacks.

Like with `bitbucket-pipelines.yml`, we'll provide you the exact YAML to copy and paste into a new `aerobatic.yml` file at the root of your repo.

Here's a side by side comparison of the legacy `package.json` structure and the new `aerobatic.yml`:

{{% col 1 %}}
**Legacy package.json**
~~~json
{
  "_aerobatic": {
    "router": [
      {
        "module": "basic-auth",
        "options": {
          "username": "$BASIC_AUTH_USERNAME",
          "password": "$BASIC_AUTH_PASSWORD"
        }
      },
      {
        "module": "custom-errors",
        "options": {
          "404": "404.html"
        }
      }
    ]
  }
}
~~~
{{% /col %}}

{{% col 2 %}}
**New aerobatic.yml**
~~~yaml
id: <website_id>
plugins:
  # Oh nice, comments!
  - name: basic-auth
    options:
      username: "$BASIC_AUTH_USERNAME"
      password: "$BASIC_AUTH_PASSWORD"

  - name: custom-errors
    options:
      404: 404.html # Custom 404 page
---
~~~
{{% /col %}}

### Web serving improvements

The underlying web serving infrastructure is mostly unchanged from before. However there are a couple of key enhancements. First we've improved how asset path rewriting is done. Originally we rewrote your images, JavaScripts, css, etc. to an absolute URL fingerprinted with your unique appId and versionId.

**Legacy asset paths**
~~~html
<!-- original html  -->
<img src="/banner.jpg" />

<!-- deployed html  -->
<img src="https://d2q4nobwyhnvov.cloudfront.net/[appId]/[versionId]/banner.jpg" />
~~~

This performance enhancement allows for aggressive cache headers since a new version would result in a new URL. However the downside is that cached versions are invalidated with a new deployment __even if the file didn't change__. The new approach is to inject a hash representing the actual file contents into the asset path. This will cause assets to be served with a 1 year expiration and the cache will only be invalidated if the MD5 hash changes.

**New asset paths**
~~~html
<!-- original html  -->
<img src="/banner.jpg" />

<!-- deployed html  -->
<img src="/banner--md5--[asset-content-hash].jpg" />
~~~

Read more about [Aerobatic asset acceleration](http://localhost:1313/docs/static-serving/#asset-acceleration).

### Pricing

If you are already a paying Aerobatic customer, your existing websites will be grandfathered in to the new plan. The free plan provides all features and unlimited deployments, but **does not** include a custom domain and daily traffic is capped at 10GB. The free plan is really intended as a way to kick the tires and get a good sense for how Aerobatic works while in development, then upgrade to the Pro Plan when you are ready to go live.

The Pro Plan is **$15 a month per website** and includes a custom domain, wildcard SSL certificate, and 500GB of data transfer per month.

{{% alert tip %}}
If you are using the free plan today with a custom domain, **you will have until March 1, 2017 to upgrade**. After that, your website will automatically be downgraded to the free plan and your custom domain will stop resolving.
{{% /alert %}}

#### Personal or hobby sites

If your site is a hobby or personal site, such as a development blog, you can request to join our "Powered By" program which waives the subscription fee for the Pro Plan. We just ask that you include a "Powered by Aerobatic" logo in your site footer hyperlinked back to www.aerobatic.com. Go ahead and migrate your site to the Pro Plan and send us an email at [support@aerobatic.com](mailto:support@aeroatic.com) requesting to be part of the program.

### Migrating your websites

You should already have an account let's you login both with the CLI and the dashboard. Your login email is the same one that you login to Bitbucket with. You will need to establish a new password by visiting: [https://dashboard.aerobatic.com/bitbucket-welcome](https://dashboard.aerobatic.com/bitbucket-welcome). Once you login, you'll be presented with a list of all your Bitbucket websites with a button to migrate them over. You'll be presented with customized instructions including the code to paste into the new `bitbucket-pipelines.yml` and `aerobatic.yml` files that need to be created.

### Bitbucket add-on retirement

We will be retiring the Bitbucket add-on on March 1st 2017. After this date any websites that have not been migrated will no longer being automatically deployed when pushing to the repo. Any non-migrated websites that are using a custom domain will be downgraded to the free plan.

### Roadmap

In the coming months you'll start to see new enhancements landing in the dashboard with the goal of making it useful not only for developers, but also non-developer website stakeholders. Specifically we want to deliver tools that facillitate an agency model where ongoing hosting and operation of the site can be turned over to a client. One typical scenario is for the development team to deploy new versions to a staging URL. The client can preview the site on a live URL like `https://www--staging.website.com` and have a self-service way for them to push the version to production from within the dashboard. The new CLI let's you [tail your weblogs](/docs/cli#logs) in near real-time and this same functionality will be coming soon to the dashboard.
