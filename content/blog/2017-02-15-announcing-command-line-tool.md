---
title: Announcing support for Github, Gitlab and any other code repository host
description: Aerobatic now is a command line tool, supporting any code Repository, including Github
slug: announcing-command-line-tool
comments: true
date: 2017-02-15
tags: github, cli
---

[Aerobatic](https://www.aerobatic.com) is a static website hosting service.  For web designers, it provides an easy alternative to complex SSL provisioning, CDN configuration, and web server setup. The service recently changed from a Bitbucket plugin to a stand-alone tool. This makes it easier to try because you can use your existing code repository anywhere.

> “If you’ve considered Aerobatic before, but stopped because it was only available on Bitbucket, now is a great time to try it out.” –Jason Gowans, Aerobatic Co-founder

Static sites are not generated dynamically by the server on each page request. While this might sound like a disadvantage, it’s actually a performance enhancement. The site is served to users faster – from AWS’s world-wide content distribution network (CDN). JavaScript can handle any updates from the server, user interaction, or the database. Static websites encompass the majority of the “front-end” of a website: the HTML, CSS, and JavaScript files.   Many single-page applications (SPA) and progressive web apps (PWA) use a static site as part of their architecture.

Github and Gitlab do offer integrated static hosting services. Although, they do not support custom domain names. Or, any of the [more advanced features](https://www.aerobatic.com/#features) of the Aerobatic platform. Plugins allow you to enhance the core static hosting features. More capabilities such as authentication, custom errors, redirects, and CORS proxies are available.

The Aerobatic hosting platform removes barriers to getting a site online. [David Von Lehman](https://www.aerobatic.com/about/) founded Aerobatic to help simplify a developer's daily experience. Enterprise developers in the past have had to wait for IT to provision a server. Independent or small business web developers have had to learn how to manage web servers. Neither task is a core competency of a web developer. Aerobatic simplifies complex deployment tasks and brings them within reach of web designers.

To have your website live and served from our global Content Delivery Network (CDN) in seconds:

#### 1. Install the aerobatic-cli from npm:

~~~bash
[$] npm install aerobatic-cli -g
~~~

If you don't already have Node.js installed, you can get it [download it from here](https://nodejs.org/en/).

#### 2. Create an Aerobatic account:

Register at [https://dashboard.aerobatic.com/register](https://dashboard.aerobatic.com/register)

#### 3. Deploy your first website:

~~~sh
[$] mkdir aerobatic-test-website
[$] cd aerobatic-test-website
[$] echo "<html>First Aerobatic Website</html>" > index.html
[$] aero create
[$] aero deploy
~~~

In less than 30 seconds your website will be deployed to an https URL on our global CDN.

If you want to try out a slightly more realistic example, try creating a website from a template such as [this one](https://html5up.net/editorial) from [HTML5 Up](https://html5up.net/). This command will automatically create a new directory with the downloaded files.

~~~sh
[$] aero create --source https://html5up.net/editorial/download
~~~

### Next Steps

* Explore how to use [plugins](/docs/configuration/#plugins) to create a custom 404 page, turn on basic auth, configure redirects, and much more. [Learn more &#8594;](/docs/configuration/#plugins)
* If you are using a CI service, find out how to configure your automated build to deploy to Aerobatic with each git push. [Learn more &#8594;](/docs/continuous-deployment/)
* Upgrade to the Pro plan for increased data transfer limits and a custom domain + matching SSL cert. [Learn more &#8594;](/docs/custom-domains-ssl/)

Aerobatic has more tutorial blog posts available at [http://aerobatic.com/blog](/blog)
