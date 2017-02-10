---
title: Optimized Docker images for continuous deployment to Aerobatic
description: Use these lightweight Docker images for building your Jekyll or Hugo sites and deploying to Aerobatic
slug: optimized-docker-images-continuous-deployment
comments: true
date: 2017-02-10
tags: docker, hugo, jekyll, cd, bitbucket pipelines
---

<div style="text-align: center; margin-bottom: 20px;">
<img src="//www.aerobatic.com/media/logos/docker-logo.png" style=" max-width: 100%; max-height: 100px;">
</div>

Aerobatic now offers two pre-built CD images: [aerobatic/hugo](https://hub.docker.com/r/aerobatic/hugo/) and [aerobatic/jekyll](https://hub.docker.com/r/aerobatic/jekyll/), that can you can use with any Docker enabled continuous integration service such as [Bitbucket Pipelines](https://bitbucket.org/product/features). Both images include their respective static generator pre-installed as well as the [aerobatic-cli](/docs/cli/), so the only work to be done is clone your code, build your site, and run [aero deploy](/docs/cli/#deploy).

Both images are based on the ultra-lightweight [Alpine Docker Image](http://gliderlabs.viewdocs.io/docker-alpine/). Smaller images lead to faster build container initialization. This, combined with less software to install with each build, means reduced time between pushing to your repo and fresh changes live on Aerobatic.

### aerobatic/hugo
Weighs in at only 66MB and includes the following:

* python / pip (2.7.13)
* hugo (v0.18.1)
* pygments
* node (v6.9.2)
* [aerobatic-cli](https://www.aerobatic.com/docs/cli/) (1.0.14)

Available on Dockerhub at https://hub.docker.com/r/aerobatic/hugo/

**bitbucket-pipelines.yml usage**

~~~yaml
image: aerobatic/hugo
pipelines:
  branches:
    master:
      - step:
          script:
            - mkdir -p themes
            - (cd themes; git clone https://github.com/alexurquhart/hugo-geo.git)
            - hugo --theme=hugo-geo --baseURL "https://__baseurl__"
            - aero deploy --directory public
---
~~~

### aerobatic/jekyll
Weighs 118MB and includes the following:

* ruby (v2.3.3)
* bundler (v1.14.3)
* jekyll (v3.4.0)
* node (v6.9.2)
* [aerobatic-cli](https://www.aerobatic.com/docs/cli/) (1.0.14)

Available on Dockerhub at https://hub.docker.com/r/aerobatic/hugo/

**bitbucket-pipelines.yml usage**

~~~yaml
image: aerobatic/jekyll
pipelines:
  branches:
    master:
      - step:
          script:
            - [ -f Gemfile ] && bundle install
            - echo "url: https://__baseurl__" >> _config.yml
            - bundle exec jekyll build
            - aero deploy --directory _site
---
~~~
