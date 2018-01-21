---
title: How To Password Protect A Hugo Site
description: Add a login page to a Hugo site hosted on Bitbucket
slug: password-protect-a-hugo-site
comments: true
date: 2017-02-19
tags: hugo, passwords, login
---

In this tutorial, we'll add a login page to our Hugo site using the Aerobatic [password-protect](/docs/plugins/password-protect/) plugin. No servers. No dynos. No hassles. Just a few lines of code and your login page will be live.

## Create a login.html

Create a `login.html` page in the `/static` directory where Hugo will pass through whatever is in that directory into your built assets.

You can style your login page however you want. What's essential is that the form markup needs to be decorated with the `aerobatic-password` attribute in the input as shown below.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
    </head>
    <body class="body">
        <div class="container">
            <div class="content center">
                <!-- login form -->
        <h6 class="error" id="password-error" style="color:red"><strong></strong></h6>
        <form method="POST">
          <label for="password">Password</label>
          <input class="u-full-width" type="password" placeholder="password" name="aerobatic-password" id="aerobatic-password">
            <input class="button-primary" type="submit" value="Submit">
        </form>
                <!-- /form -->
            </div>
        </div>
        <!-- /container -->
        <!-- JS -->
        <script>
            if (/fail=1/.test(location.search)) {
              document.getElementById("password-error").innerHTML= "Incorrect Password" ;
            }
        </script>
    </body>
</html>
```

## Create Aerobatic site

Assuming you've already installed the aerobatic-cli, from the command line, enter the following to associate your Hugo site with Aerobatic:

```bash
aero create
```

## Edit `aerobatic.yml`

This is where you'll take advantage of Aerobatic's built-in [password-protect](https://www.aerobatic.com/docs/plugins/password-protect/) plugin. In the root of your Hugo site, open up the newly created `aerobatic.yml` file and edit like so:

```yaml
# Aerobatic website manifest
id: <YOUR AEROBATIC SITE'S ID>
plugins:
  - name: password-protect
    options:
      password: $SITE_PASSWORD
      loginPage: login.html
      maxFailures: 5
      failureWindow: 600
      lockoutDuration: 600
      ignorePatterns:
        - '/css/*.css'
        - '/js/*.js'
        - '/img/*.jpg'
  - name: webpage
```

You'll notice here a couple of things. The first is that we have an environment variable called `$SITE_PASSWORD`. The second thing you probably noticed is that we're telling the password-protect plugin to not protect a few files, namely some CSS, JS, and JPG files. That's so they can load on the login.html page and not get a 401 error before the password has been entered.

## Create environment variable

Login to the [Aerobatic dashboard](dashboard.aerobatic.com), and navigate to your site's settings. Enter a value for your newly created environment variable. In this example, the `SITE_PASSWORD` variable has a value of `aerobatic`.

<img class="screenshot" src="/img/jekyll-auth-env-var.png" alt="Aerobatic Environment Variable">

## Set up Bitbucket Pipelines Continuous Deployment

At this point you could just type `aero deploy -d public` to deploy your Hugo site. However, in this case, we're going to use [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines) to set up a nice continuous deployment flow. Make sure you enable Bitbucket Pipelines in your repo, and here's what your `bitbucket-pipelines.yml` file might look like (you may have noticed we're using Aerobatic's [custom docker image](https://www.aerobatic.com/blog/optimized-docker-images-continuous-deployment/) for Hugo:

```bash
image: aerobatic/hugo
pipelines:
  branches:
    master:
      - step:
          script:
            - git clone https://github.com/alexurquhart/hugo-geo.git themes/hugo-geo
            - hugo --theme=hugo-geo --baseURL "https://__baseurl__"
            - aero deploy --directory public
```

### Push your changes

Either from the command line, or with a tool like [Sourcetreee](https://www.sourcetreeapp.com/), push the changes to your Jekyll repository. e.g.

```bash
git add --all
git commit -m "Added a login page"
git push origin master
```

## Summary

That's it! Your Hugo site is now password protected with a branded login page. In this example, we've added protection to the whole site, but you can also add it to specific folders. For example, maybe your landing page is open to everyone, but you want your `/post` content to be password protected. That's all possible with the [password-protect](/docs/plugins/password-protect/) plugin.

Additionally, maybe you want to handle the 401 error with a custom error page if the user incorrectly enters their credentials. Again, all possible with the Aerobatic [custom-errors](/docs/custom-error-pages) plugin.

The demo Hugo site can be found at [https://hugo-demo.aerobaticapp.com/](https://hugo-demo.aerobaticapp.com/) and the source code is on [Bitbucket](https://bitbucket.org/dundonian/hugo-demo/src).
