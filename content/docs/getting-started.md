---
title: Getting Started
name: getting-started
---

# Getting Started

Aerobatic is a static website hosting platform, used by thousands of developers to host websites built with HTML, CSS, and JavaScript - including output from [static site generators](/docs/static-generators), and modern Single Page Apps (SPAs).

To have your website live and served from our global Content Delivery Network (CDN) in seconds:

#### 1. Install the aerobatic-cli from npm:

~~~bash
[$] npm install aerobatic-cli -g
~~~

If you don't already have Node.js installed, you can get it [download it from here](https://nodejs.org/en/).

#### 2. Create an Aerobatic account:

Register at [https://dashboard.aerobatic.com/dashboard](https://dashboard.aerobatic.com/dasbhboard)

#### 3. Deploy your first website:

~~~sh
[$] mkdir aerobatic-test-website
[$] cd aerobatic-test-website
[$] echo "<html>First Aerobatic Website</html>" > index.html
[$] aero create -n your-site-name
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
