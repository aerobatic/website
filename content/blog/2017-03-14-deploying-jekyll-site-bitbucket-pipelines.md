---
title: Jekyll Continuous Deployment with Bitbucket Pipelines and Aerobatic
description: A tutorial on how to continuously build and deploy a Jekyll site with Bitbucket Pipelines.
comments: true
date: 2017-03-14
tags: bitbucket, jekyll, bitbucket pipelines
slug: jekyll-bitbucket-pipelines
---

Hosting a Jekyll site with Aerobatic can be as easy as typing in a couple of commands using the Aerobatic CLI:

```bash
[$] jekyll new my-jekyll-site
[$] cd my-jekyll-site
[$] aero create -n my-jekyll-site                            # create the Aerobatic site
[$] echo "url: https://__baseurl__" > _aerobatic.config.yml  # override site.url for Aerobatic
[$] jekyll build --config _config.yml,_aerobatic.config.yml  # generate the output
[$] aero deploy --directory _site                            # deploy output to Aerobatic

Version v1 deployment complete.
View now at https://my-jekyll-site.aerobaticapp.com
```

In the example above, we compiled our site locally and deployed the `/_site` directory to Aerobatic. However, using [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines), we can set things up such the site is automatically built and deployed with each push to a Bitbucket repository.

## Step 1: Create a Bitbucket Repository

First, [create a repository](https://confluence.atlassian.com/bitbucket/create-a-git-repository-759857290.html) in Bitbucket, and then push your jekyll site to the newly created repository:

```bash
# initialize new git repository
[$] git init

# set up our .gitignore file
[$] echo -e "/_site\naero-deploy.tar.gz" >> .gitignore

# commit and push code to master branch
[$] git add --all
[$] git commit -m "Initial commit"
[$] git remote add origin git@bitbucket.org:YourUsername/jekyll-pipelines.git
[$] git push -u origin master
```

## Step 2: Configure Bitbucket Pipelines

In your website's Bitbucket repo:

1.  Click the Pipelines link in the left nav menu of your Bitbucket repository.
2.  Click the Enable Pipelines button.
3.  On the next screen, leave the default template and click Next.
4.  In the editor, paste in the YAML contents below and click Commit.

```yaml
image: aerobatic/jekyll
pipelines:
  branches:
    master:
      - step:
          script:
            - '[ -f Gemfile ] && bundle install'
            - 'echo "url: https://__baseurl__" >> _config.yml'
            - bundle exec jekyll build
            - aero deploy --directory _site
```

To make the build as steps as streamlined as possible, there's a ready-made docker image [aerobatic/jekyll](https://hub.docker.com/r/aerobatic/jekyll/) that already has Ruby, Bundler, Jekyll, [aerobatic-cli](/docs/cli/), and other supporting software for building native plugin gems all ready to go.

The `https://!!baseurl!!` is a special value that Aerobatic will substitute on the fly with the current website URL. This makes it so the same deployed version can be safely pushed to a different deploy stage and all absolute URLs will auto-correct themselves.

### Gemfile

It's recommended that you include a Gemfile that includes the specific version of Jekyll you want to build your site with, along with any plugin gems. Here's the Gemfile that the `jekyll new` command generates:

```ruby
source "https://rubygems.org"
ruby RUBY_VERSION

# Hello! This is where you manage which Jekyll version is used to run.
# When you want to use a different version, change it below, save the
# file and run `bundle install`. Run Jekyll with `bundle exec`, like so:
#
#     bundle exec jekyll serve
#
# This will help ensure the proper Jekyll version is running.
# Happy Jekylling!
gem "jekyll", "3.4.0"

# This is the default theme for new Jekyll sites. You may change this to anything you like.
gem 'minima', '2.1.0'

# If you have any plugins, put them here!
group :jekyll_plugins do
   gem "jekyll-feed", "~> 0.6"
   gem 'jekyll-tagging', '1.0.1'
   gem 'jekyll-paginate', '1.1.0'
   gem 'jekyll-sitemap', '1.0.0'
end
```

It's also a good idea to run `bundle install` to generate a `Gemfile.lock` that should be committed to source control.

The code for this example can be found in this Bitbucket [repository](https://bitbucket.org/aerobatic/jekyll-pipelines).

## Step 3: Create environment variable

This step only needs to be done once per account. If you haven't already done this in Bitbucket, from the command line:

```bash
[$] aero apikey
```

1.  Navigate to the Bitbucket account settings for the account that the website repo belongs to.
2.  Scroll down to the bottom of the left nav and click the Environment variables link in the PIPELINES section.
3.  Create a new environment variable called `AEROBATIC_API_KEY` with the value you got by running the `aero apikey` command. Be sure to click the Secured checkbox.

## Step 4: Edit and Commit Code

Now that we've got Bitbucket Pipelines set up, we're now ready to test that everything is working smoothly. Push a commit to your repo and Pipelines will provision a Docker container, clone your code, and run your build script which builds your site and deploys it to Aerobatic.

## Deploy stages

Aerobatic [deploy stages](/docs/deployment/#deploy-stages) makes it trivially easy to deploy your site to a test URL by passing the `--stage` option to the `deploy` CLI command. This plays nicely with Pipelines mechanism for running different build steps per branch.

```yaml
image: aerobatic/jekyll
pipelines:
  branches:
    master:
      - step:
          script:
            - '[ -f Gemfile ] && bundle install'
            - 'echo "url: https://__baseurl__" >> _config.yml'
            - bundle exec jekyll build
            - aero deploy --directory _site
    develop:
      - step:
          script:
            - '[ -f Gemfile ] && bundle install'
            - 'echo "url: https://__baseurl__" >> _config.yml'
            - bundle exec jekyll build
            - aero deploy --directory _site --stage staging
```

With this configuration, any push to the `master` branch will deploy to `https://jekyll-pipelines.aerobaticapp.com` and pushes to the `develop` branch will deploy to `https://jekyll-pipelines--staging.aerobaticapp.com`. This of course works with custom domains as well.

## Additional reading

* The code for this example can be found in this Bitbucket [repository](https://bitbucket.org/aerobatic/jekyll-pipelines).
* Learn how to use [declare plugins](/docs/plugins/) in your `aerobatic.yml` to extend the capabilities of your static Jekyll site.
* [How to Password Protect a Jekyll site](/blog/password-protect-a-jekyll-site/)

## Troubleshooting

Jekyll seems to be very particular when running in the Docker container about the format of the `_config.yml` and `Gemfile`. If you get the error below, look at the files in the [sample repo](https://bitbucket.org/aerobatic/jekyll-pipelines) for guidance. Some users have reported they needed a line break at the end of the `_config.yml`.

```text
jekyll 3.4.2 | Error:  (/opt/atlassian/pipelines/agent/build/_config.yml): mapping values are not allowed in this context
```
