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

Register at [https://dashboard.aerobatic.com/register](https://dashboard.aerobatic.com/register)

#### 3. Deploy your first website:

~~~sh
[$] mkdir aerobatic-test-website
[$] cd aerobatic-test-website
[$] echo "<html>First Aerobatic Website</html>" > index.html
[$] aero create -n your-site-name
[$] aero deploy
~~~

In less than 30 seconds your website will be deployed to an https URL on our global CDN.

#### Or use a theme

You can also create a new site using a packaged theme for Jekyll, Hugo, or plain HTML5 sites. Below are some examples you can try or browse the [Aerobatic theme gallery](/themes/) for something that catches your eye.

~~~sh
[$] aero create --theme jekyll/agency
~~~

~~~sh
[$] aero create --theme hugo/creative-portfolio
~~~

~~~sh
[$] aero create --theme html5/sb-business-casual
~~~

### Next Steps

* Explore how to use [plugins](/docs/plugins/) to create a custom 404 page, turn on basic auth, configure redirects, and much more. [Learn more &#8594;](/docs/configuration/plugins)
* If you are using a CI service, find out how to configure your automated build to deploy to Aerobatic with each git push. [Learn more &#8594;](/docs/continuous-deployment/)
* Upgrade to the Pro plan for increased data transfer limits and a custom domain + matching SSL cert. [Learn more &#8594;](/docs/custom-domains-ssl/)
