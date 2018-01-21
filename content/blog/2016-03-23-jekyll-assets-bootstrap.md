---
title: Jekyll, Bootstrap, Sass, and asset pipelines
description: Build optimized asset bundles to speed up your Jekyll site
slug: jekyll-assets-bootstrap
comments: true
date: 2016-03-23
tags: jekyll, plugin, bootstrap, static site generator, cd
---

<div style="margin-bottom: 20px; text-align: center;">
<img src="https://www.aerobatic.com/media/blog/bootstrap-plus-jekyll.png" style="max-width: 100%;">
</div>

Twitter Bootstrap has 94K stars on GitHub and Jekyll 24K. I'd say these two open-source darlings are due for a mashup. In this tutorial we'll be building a "Jekyll-ified" version of the [official Bootstrap blog example template](http://getbootstrap.com/examples/blog/#).

Rather than simply including the entire Bootstrap CSS and JavaScript into the page, we'll be smarter about it and leverage the [jekyll-assets](https://github.com/jekyll/jekyll-assets) plugin and [bootstrap-sass](https://github.com/twbs/bootstrap-sass) to only pull in the parts that we actually need cutting down on the overall page weight.

Leveraging Aerobatic's [support for auto-building Jekyll sites](docs/automated-builds#jekyll), including plugins, we'll have an asset optimized, CDN delivered, continuously deployed, Jekyll Bootstrap blog in no time.

If you want a sneak peek, the final product can be viewed at [https://jekyll-bootstrap-blog.aerobaticapp.com/](https://jekyll-bootstrap-blog.aerobaticapp.com/) and the source code at [https://bitbucket.org/aerobatic/jekyll-bootstrap-blog](https://bitbucket.org/aerobatic/jekyll-bootstrap-blog).

## Configuration

First off we're going to need the following gems installed:

* [`jekyll-assets`](https://github.com/jekyll/jekyll-assets) - an asset pipeline using Sprockets 3 to built specifically for Jekyll 3.
* [`bootstrap-sass`](https://github.com/twbs/bootstrap-sass) - the official Sass powered version of Bootstrap 3. Also includes `bootstrap-sprockets` which provides the ability to require just the individual JavaScript components we need.
* [`uglifier`](https://rubygems.org/gems/uglifier/versions/2.7.2) - Minifies JavaScript files

You'll need to ensure the gems are installed for local development:

~~~sh
gem install jekyll-assets bootstrap-sass uglifier
~~~

Then also list them in the `_config.yml`. This is where the Aerobatic build pipeline looks for the gems that need to be installed prior to running `jekyll build`.

~~~yaml
gems: [jekyll-assets, bootstrap-sass, uglifier]
~~~

If you need to, you can also override `jekyll-assets` configuration settings here. For this tutorial we'll mostly be using the default settings, with one exception and that is to turn the `digest` off. By default this setting is true for production builds, but since we'll be deploying to Aerobatic, the asset URLs will already be fingerprinted.

~~~yaml
assets:
  digest: false
~~~

The default behavior is to only compress the assets in production and leave them be in development. The Aerobatic build sets `JEKYLL_ENV=production` so your live deployed site will have minified assets.

## Website structure

To keep things simple, we'll adopt the default naming conventions of `jekyll-assets`. At the root of the repo is an `_assets` directory with sub-directories `stylesheets` and `javascripts`. The asset pipeline will bundle all CSS into a single `main.css` file and all JavaScript into a single `main.js` file. To facilitate this we need to create the entry points `_assets/stylesheets/main.scss.css` and `_assets/javascripts/main.js`.

Our solution structure should now resemble the following:

~~~sh
.
├── _assets
│   ├── javascripts
│   │   └── main.js
│   └── stylesheets
│       └── main.scss.css
├── _config.yml
├── _includes
│   ├── footer.html
│   ├── head.html
│   └── header.html
├── _layouts
│   ├── default.html
│   ├── page.html
│   └── post.html
├── _posts
│   └── 2016-03-23-welcome-to-jekyll.markdown
├── feed.xml
└── index.html
~~~

In `_includes/header.html` declare the custom `stylesheet` liquid tag that will pull in the `main.css` stylesheet.

~~~html
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <title>{{ page.title }}</title>

  {% raw %}{% stylesheet main %}{% endraw %}
</head>
~~~

In `_layouts/default.html` declare the `javascript` liquid tag that will render the `<script>` tag containing all our bundled JavaScript.

{% raw %}
~~~html
<!DOCTYPE html>
<html>
  {% include head.html %}
  <body>
    {% include header.html %}

    <div class="container">
      <div class="row">
        {{ content }}
      </div>
    </div>

    {% include footer.html %}
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js"></script>
    {% javascript main %}
  </body>
</html>
~~~
{% endraw %}

## Bootstrap CSS

Now let's pull in the parts of Bootstrap that we care about. Copy the contents of the original `_bootstrap.scss` in GitHub and paste it into a new file at `_assets/stylesheets/bootstrap-custom.scss`.

[https://github.com/twbs/bootstrap-sass/blob/master/assets/stylesheets/_bootstrap.scss](https://github.com/twbs/bootstrap-sass/blob/master/assets/stylesheets/_bootstrap.scss)

Now delete any of the `@import` lines corresponding to the Bootstrap components that you don't plan to use. For this sample we'll be left with this minimal set of imports:

~~~sass
// Core variables and mixins
@import "bootstrap/variables";
@import "bootstrap/mixins";

// Reset and dependencies
@import "bootstrap/normalize";

// Core CSS
@import "bootstrap/scaffolding";
@import "bootstrap/type";
@import "bootstrap/code";
@import "bootstrap/grid";
~~~

The Bootstrap blog template uses a custom stylesheet which can be seen at [http://getbootstrap.com/examples/blog/blog.css](http://getbootstrap.com/examples/blog/blog.css). Copy the contents of that file into `_assets/stylesheets/blog.scss`. Now we can import both of these Sass files into our `main.scss.css` taking care to put `bootstrap-custom` first:

~~~scss
@import "bootstrap-custom";
@import "blog";
~~~

You can add additional Sass rules in `main.scss.css` or keep things organized by adding additional `.scss` files and importing them in the same fashion. That covers our CSS asset configuration, now let's move on to the JavaScript.

## Bootstrap JavaScript

The Bootstrap JavaScript components depend upon jQuery. While we could bundle jQuery into the `main.js` file, there's little advantage to that since jQuery is an all or nothing proposition. I prefer to reference it from the [Google CDN](https://developers.google.com/speed/libraries/#jquery).

In this example we'll just take the [dropdown](http://getbootstrap.com/javascript/#dropdowns) component which we require at the top of `_assets/javascripts/main.js`:

~~~js
//= require bootstrap/dropdown

$(function() {
  // Your custom javascript
});
~~~

To put the JavaScript to work we'll add a dropdown button after each blog post that allows the reader to take actions on the post like "Favorite", "Save for Later", "Email", etc.

~~~html
<div class="dropdown">
  <button type="button" data-toggle="dropdown">
    Actions
    <span class="caret"></span>
  </button>
  <ul class="dropdown-menu">
    <li><a href="#">Add to favorites</a></li>
    <li><a href="#">Email</a></li>
    <li><a href="#">Save for later</a></li>
  </ul>
</div>
~~~

## Deploying to Aerobatic

At this point the asset pipeline is all in place. We can run `jekyll serve` and view the site at `http://localhost:4000` and verify everything looks good. There's just one more step to configure the site to be automatically built by the Aerobatic CD pipeline. Add a `package.json` file in the root of the repo with this section:

~~~json
{
  "_aerobatic": {
    "build": {
      "engine": "jekyll"
    }
  }
}
~~~

Once your Bitbucket repo is linked to Aerobatic, you just `git push` and the build pipeline will install the gems specified in `_config.yml`, run `jekyll build` in production mode, and finally deploy the output to our highly scalable cloud hosting platform. Here's the output of the build log that will appear in the Deployments dashboard:

~~~sh
[INFO]: use build engine jekyll
[INFO]: start jekyll deployment
[INFO]: read bundle jekyll/450e1fc2-1d30-45c1-83dc-4b42937930a6/1458883575286.tar.gz
[INFO]: loading jekyll _config.yml
[INFO]: installing gem jekyll-assets
[INFO]: installing gem bootstrap-sass
[INFO]: installing gem uglifier
[INFO]: gem complete
[INFO]: Successfully installed execjs-2.6.0 Successfully installed uglifier-3.0.0 2 gems installed
[INFO]: gem complete
[INFO]: Successfully installed sass-3.4.21 Successfully installed execjs-2.6.0 Successfully installed autoprefixer-rails-6.3.4 Successfully installed bootstrap-sass-3.3.6 4 gems installed
[INFO]: gem complete
[INFO]: running jekyll build
[INFO]: Configuration file: /tmp/HnlPlK2VLUI2-A/source/_config.yml
[INFO]: Source: /tmp/HnlPlK2VLUI2-A/source Destination: /tmp/HnlPlK2VLUI2-A/output
[INFO]: Incremental build: disabled. Enable with --incremental Generating...
[INFO]: done in 7.895 seconds. Auto-regeneration: disabled. Use --watch to enable.
[INFO]: jekyll complete
[INFO]: deploying compiled jekyll site
[INFO]: deploying directory /tmp/HnlPlK2VLUI2-A/output
[INFO]: done deploying 7 files
[INFO]: new versionId is HnlPlK2VLUI2-A
~~~

{% raw %}
If you do a view-source on [https://jekyll-bootstrap-blog.aerobaticapp.com/](http://getbootstrap.com/examples/blog/blog.css) you'll see at the spots where the `{% stylesheet main %}` and `{% javascript main %}` liquid tags were declared, the following tags are being rendered:
{% endraw %}

~~~html
<link type="text/css" rel="stylesheet" href="//d2q4nobwyhnvov.cloudfront.net/450e1fc2-1d30-45c1-83dc-4b42937930a6/HnlPlK2VLUI2-A/assets/main.css"/>
...
<script type="text/javascript" src="//d2q4nobwyhnvov.cloudfront.net/450e1fc2-1d30-45c1-83dc-4b42937930a6/HnlPlK2VLUI2-A/assets/main.js"></script>
~~~

The delivery of these assets checks all the boxes when it comes to website optimization best practices:

<div class="checkbox-list" markdown="1">
* GZip compression
* Far future `Cache-Control` header set to `public, max-age=31557600` (1 year)
* Consolidated multiple css and js files into these two bundled downloads
* Eliminated unnecessary Bootstrap CSS and JavaScript components reducing download sizes
* Served off a global CDN (CloudFront)
</div>

## Wrapping Up

So there we have it, Bootstrap and Jekyll, truly a match made in hacker heaven. Once you get the plumbing in place, it's really easy to add additional styles and JavaScript added to the bundles. And with Aerobatic, deployment couldn't be smoother, just `git push` and you're done. Once again, here's the [source code](https://bitbucket.org/aerobatic/jekyll-bootstrap-blog) if you'd like to fork it and deploy it for yourself.
