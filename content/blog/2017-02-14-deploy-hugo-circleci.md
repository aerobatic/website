---
title: Deploy a Hugo site to Aerobatic with CircleCI
description: With the recent introduction of our new CLI, you can now host your Hugo sites on GitHub and using a Continuous Deployment tool like CircleCI, deploy to Aerobatic.
slug: hugo-github-circleci
comments: true
date: 2017-02-14
tags: hugo, circleci, cd, github
---

With the recent introduction of our new CLI, you can now host your Hugo sites on GitHub and using a Continuous Deployment tool like [CircleCI](https://circleci.com), deploy to Aerobatic.

## Step 1: Create a new Hugo site

~~~bash
[$] hugo new site aerohugo && cd $_
[$] git clone https://github.com/rakuishi/hugo-zen.git themes/hugo-zen
[$] cd ..
[$] hugo new post/good-to-great.md
[$] hugo serve --theme=hugo-zen --buildDrafts
~~~

At this point, we could now simply create and deploy the site to Aerobatic like so;

~~~bash
[$] hugo
[$] aero create
[$] aero deploy -d public
~~~

However, in this case, what we'd instead like to do is host our site on GitHub and, using CircleCI, auto-build and deploy our site to Aerobatic with each commit to GitHub. That way, we set things up once, and from then on, we only need to author markdown and make our commits. We can even author new blog posts directly in the GitHub UI.

## Step 2: Commit code to GitHub

Go ahead and create a new repository in GitHub at [https://github.com/new](https://github.com/new). Once the repository is created, then push your code to GitHub:

~~~bash
# initialize new git repository
[$] git init

# set up our .gitignore and README files
[$] echo -e "/public \n/themes \naero-deploy.tar.gz" >> .gitignore
[$] echo "# aerohugo" >> README.md

# commit and push code to master branch
[$] git add --all
[$] git commit -m "first commit"
[$] git remote add origin https://github.com/Dundonian/aerohugo.git
[$] git push -u origin master
~~~

## Step 3: Set Up CircleCI

Go to [https://circleci.com/dashboard](https://circleci.com/dashboard) and select the Hugo project you want to build with CircleCI.

Once you've done that, you'll then also need to add the `AEROBATIC_API_KEY` to CircleCI. You can get your Aerobatic API key by running `aero apikey` from the command line.

<img class="screenshot" src="/img/circle-ci-env-var.png" alt="Aerobatic API Key">

## Step 4: Create `circle.yml`

In the root of your repository, you should create a `circle.yml` file to deploy your Hugo site to Aerobatic.


~~~yaml
dependencies:
  pre:
    - wget https://github.com/spf13/hugo/releases/download/v0.18/hugo_0.18-64bit.deb
    - sudo dpkg -i hugo*.deb
    - npm install -g aerobatic-cli

deployment:
  master:
    branch: master
    commands:
      - git clone https://github.com/rakuishi/hugo-zen.git themes/hugo-zen
      - hugo --theme=hugo-zen --baseURL https://!!baseurl!! --buildDrafts
      - aero deploy -d public
~~~

Once you push this new file to GitHub, your site will be automatically built and deployed by CircleCI:

~~~bash
# commit and push code to master branch
[$] git add --all
[$] git commit -m "added circle.yml"
[$] git remote add origin https://github.com/Dundonian/aerohugo.git
[$] git push -u origin master
~~~

<img class="screenshot" src="/img/aero-deploy.png" alt="Aerobatic Deploy">

## Conclusion

At this point, with your build process set up, you can now author new blog posts directly in GitHub, make your commit, everything will be built, and a new version of your site will be deployed immediately.

<img class="screenshot" src="/img/author-gh.png" alt="Author in GitHub">

And that's it. Happy Coding!

