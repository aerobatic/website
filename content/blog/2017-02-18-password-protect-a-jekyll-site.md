---
title: How To Password Protect A Jekyll Site
description: Add a login page to a Jekyll site in a few minutes without worrying about server-side code
slug: password-protect-a-jekyll-site
comments: true
date: 2017-02-18
tags: jekyll, passwords, login
---

You've got a [Jekyll](https://jekyllrb.com/) site, and now you're wondering how to password protect some or all of the content. Perhaps the site is under development and you want to make it viewable to only your client for review. You could set something up on Heroku, but that's expensive and total overkill for a simple password form. When you made the smart move to a static generator instead of some CMS, presumably one of your goals was to negate the need for servers and databases altogether.

Well, the good news is that, with Aerobatic, you can create a login page for your Jekyll site with just a few lines of code. No servers. No dynos. No hassles. Want to see how easy it is? Let's go...

## Create a login.html

In your Jekyll site, you've got an **index.html** in the root folder. Make a copy of that file and call it **login.html**. Replace the content of the login.html file with code similar to below. You can style your login page however you want. What's essential is that the form markup needs to be decorated with the `aerobatic-password` attribute in the input as shown below.

```html
---
layout: [INSERT YOUR SITE'S LAYOUT]
---
<!DOCTYPE html>
<html lang="en">
    <head>
    </head>
    <body class="body">
        <div class="container">
            <header class="header">
                <h1>Jekyll Auth<span>No servers required.</span></h1>
            </header>
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

Assuming you've already installed the aerobatic-cli, from the command line, enter the following to associate your Jekyll site with Aerobatic:

```bash
aero create
```

## Edit `aerobatic.yml`

This is where you'll take advantage of Aerobatic's built-in [password-protect](https://www.aerobatic.com/docs/plugins/password-protect/) plugin. In the root of your Jekyll site, open up the newly created `aerobatic.yml` file and edit like so:

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

The demo site for adding a custom login page can be found at [https://jekyll-auth.aerobaticapp.com/](https://jekyll-auth.aerobaticapp.com/) and the source code is on [Bitbucket](https://bitbucket.org/dundonian/jekyll-auth/src).

## Set up Bitbucket Pipelines Continuous Deployment

At this point you could just type `aero deploy -d _site` to deploy your site. However, in this case, we're going to use [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines) to set up a nice continuous deployment flow. Make sure you enable Bitbucket Pipelines in your repo, and here's what your `bitbucket-pipelines.yml` file might look like (you may have noticed we're using Aerobatic's [custom docker image](https://www.aerobatic.com/blog/optimized-docker-images-continuous-deployment/) for Jekyll:

```bash
image: aerobatic/jekyll
pipelines:
  branches:
    master:
      - step:
          script:
            - jekyll build
            - aero deploy --directory _site
```

### Push your changes

Either from the command line, or with a tool like [Sourcetreee](https://www.sourcetreeapp.com/), push the changes to your Jekyll repository. e.g.

```bash
git add --all
git commit -m "Added a login page"
git push origin master
```

## Summary

And that's it! The demo site for adding a custom login page can be found at [https://jekyll-auth.aerobaticapp.com/](https://jekyll-auth.aerobaticapp.com/) and the source code is on [Bitbucket](https://bitbucket.org/dundonian/jekyll-auth/src).
