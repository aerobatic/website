---
title: Continuous Deployment of a Jekyll Site with Travis CI and Aerobatic
description: Aerobatic builds, deploys, and hosts your Jekyll site from Github, using Travis CI.
slug: jekyll-travis-github-aerobatic
comments: true
date: 2017-02-06
tags: jekyll, static site generator, travis, cd
---

With the new Aerobatic CLI, it's now possible to host any static site using any CI tool, and the repo need not be hosted with Bitbucket. In this example, we'll set up continuous deployment of a [Jekyll](https://jekyllrb.com/) site whose repository is hosted on GitHub, using [Travis CI](https://travis-ci.org/).

## Step 1: Pick a Jekyll theme and fork it

From the [Jekyll Themes](http://jekyllthemes.org/) site, pick a theme and fork it in GitHub.

<img class="screenshot" src="/img/github-fork.png" alt="Fork repo">

Then, clone that repository onto your local disk.

## Step 2: Enable Travis and GitHub

1. Go to your profile on travis-ci.org: https://travis-ci.org/profile/username
2. Find the repository for which you’re interested in enabling builds.
3. Click the slider on the right so it flips from a grey "X" to a green "✓".

## Step 3: Create `travis.yml`

In the root of your repository, create a new file called `travis.yml`.

```bash
cd my-jekyll-site
```

```yaml
language: ruby
env:
  global:
  - secure: AEROBATIC_API_KEY
  - TRAVIS_NODE_VERSION="6.9.5"

install:
  - rm -rf ~/.nvm && git clone https://github.com/creationix/nvm.git ~/.nvm && (cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`) && source ~/.nvm/nvm.sh && nvm install $TRAVIS_NODE_VERSION
  - npm install aerobatic-cli -g
  - bundle install --path vendor/bundle

script:
- echo "url: https://!!baseurl!!" >> _config.yml
- bundle exec jekyll build

after_success:
- aero deploy -d _site
```

## Step 4: Create aerobatic.yml

We now need to associate the repo with Aerobatic by creating the site. Assuming you have already installed the [Aerobatic CLI](https://www.aerobatic.com/docs/getting-started/):

```bash
cd my-jekyll-site
aero create
```

## Step 5: Set Secure Environment Variable

An environment variable named `AEROBATIC_API_KEY` needs to be set in the build script in order to make authenticated calls to the Aerobatic API. Each CD service has a mechanism for setting environment variables. It’s recommended that the value be encrypted if your service supports it. Travis provides a [command line tool](https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml) for encrypting a variable and injecting it into the `travis.yml` file.

```bash
aero apikey
gem install travis
travis encrypt AEROBATIC_API_KEY=<super_secret> --add env.matrix
```

To get your `AEROBATIC_API_KEY` to insert into the placeholder `<super_secret>`, you can run the `aero apikey` command.

## Step 6: Deploy Site

At this point, you're ready to commit your code and let Travis build the Jekyll site for you

```bash
git add --all
git commit -m "Set up Travis build"
git push origin master
```

As a reminder, if you run `aero info`, you'll get your production URL. You can also rename the site if you so wish with the `aero rename` command.

<img class="screenshot" src="/img/travis-build.png" alt="Travis build">
