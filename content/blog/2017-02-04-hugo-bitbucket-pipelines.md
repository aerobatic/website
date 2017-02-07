---
title: Hugo Continuous Deployment with Bitbucket Pipelines and Aerobatic
description: A tutorial on how to continuously build and deploy a Hugo site with Bitbucket Pipelines.
comments: true
date: 2017-02-04
tags: bitbucket, hugo, bitbucket pipelines
slug: hugo-bitbucket-pipelines
hideBitbucketAlert: true
---

Hosting a Hugo site with Aerobatic can be as easy as typing in a couple of commands using the Aerobatic CLI:

~~~bash
hugo new site my-new-hugo-site
cd my-new-hugo-site
cd themes; git clone https://github.com/eliasson/liquorice
hugo -t liquorice
aero create                                           # create the Aerobatic site
hugo --baseURL https://my-new-hugo-site.aerobatic.io  # build the site overriding baseURL
aero deploy -d public                                 # deploy output to Aerobatic

Version v1 deployment complete.
View now at https://hugo-docs-test.aerobatic.io
~~~

In the example above, we compiled our site locally and deployed the `/public` directory to Aerobatic. However, using [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines), we can set things up such that we can create new blog posts directly in Bitbucket, and have Bitbucket Pipelines automatically build our Hugo site and deploy a new version to Aerobatic.

## Step 1: Create a Bitbucket Repository

First, [create a repository](https://confluence.atlassian.com/bitbucket/create-a-git-repository-759857290.html) in Bitbucket, and then push your hugo site to the newly created repository:


~~~bash
# initialize new git repository
git init

# set up our .gitignore file
echo -e "/public \n/themes \naero-deploy.tar.gz" >> .gitignore

# commit and push code to master branch
git add --all
git commit -m "Initial commit"
git remote add origin git@bitbucket.org:YourUsername/my-new-hugo-site.git
git push -u origin master
~~~

## Step 2: Configure Bitbucket Pipelines

In your Hugo website's Bitbucket repo;

1. Click the Pipelines link in the left nav menu of your Bitbucket repository.
2. Click the Enable Pipelines button.
3. On the next screen, leave the default template and click Next.
4. In the editor, paste in the yaml contents below and click Commit.

~~~yaml
image: beevelop/nodejs-python
pipelines:
  branches:
    master:
      - step:
          script:
            - apt-get update -y && apt-get install wget
            - apt-get -y install git
            - wget https://github.com/spf13/hugo/releases/download/v0.18/hugo_0.18-64bit.deb
            - dpkg -i hugo*.deb
            - git clone https://github.com/eliasson/liquorice themes/liquorice
            - hugo --theme=liquorice --baseURL https://!!baseurl!! --buildDrafts
            - npm install -g aerobatic-cli
            - aero deploy
~~~

## Step 3: Create environment variable

This step only needs to be done once per account. If you haven't already done this in Bitbucket, from the command line;

~~~bash
aero apikey
~~~

1. Navigate to the Bitbucket account settings for the account that the website repo belongs to.
2. Scroll down to the bottom of the left nav and click the Environment variables link in the PIPELINES section.
3. Create a new environment variable called `AEROBATIC_API_KEY` with the value you got by running the `aero apikey` command. Be sure to click the Secured checkbox.

## Step 4: Edit and Commit Code

Now that we've got Bitbucket Pipelines set up, we're now ready to test that everything is working smoothly.

```bash
hugo new post/good-to-great.md
hugo server --buildDrafts -t liquorice #Check that all looks good

# commit and push code to master branch
git add --all
git commit -m "New blog post"
git push -u origin master
```

Your code will be committed to Bitbucket, Bitbucket Pipelines will run your build, and a new version of your site will be deployed to Aerobatic.

At this point, you can now create and edit blog posts directly in the Bitbucket UI.

<img class="screenshot" src="/img/bitbucket-blog-post.png" alt="Author in Bitbucket">


## Suggested next steps

The code for this example can be found in this Bitbucket [repository](https://bitbucket.org/dundonian/hugo-docs-test). Aerobatic also provides a number of additional [plugins](https://www.aerobatic.com/docs) such as auth and redirects that you can use for your Hugo site.
