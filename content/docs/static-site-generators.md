---
title: Static site generators
name: static-site-generators
---

# Static site generators

Aerobatic is a perfect hosting complement to static site generators such as [Jekyll](), Hugo, Middleman and others. Simply configure `aerobatic-cli` to deploy the directory where the generator emits the built site (`_site`, `public`, `dist`, etc.).

There are two ways to configure the deploy directory:

* Add a `deploy` section to your `aerobatic.yml` with a `directory` prop:
  ~~~
  deploy:
    directory: _site
  ~~~

  With this approach you just run `aero deploy` to deploy your site.

* **Or**, pass a command line option:
  ~~~
  aero deploy --directory _site
  # or
  aero deploy -d _site
  ~~~

Full docs on the [deploy command](/docs/cli#deploy)

### Relative vs absolute urls {#relative-absolute-urls}
In general we suggest using relative URLs in your template files since the browser will automatically resolve them to the current host and protocol. For example:

~~~html
<!-- Prefer this: -->
<a href="/about/contact">Contact Us</a>
<!-- Over this: -->
<a href="https://yoursite.com/about/contact">Contact Us</a>
~~~

That way the same markup will function identically no matter where what the base host is, i.e. `http://localhost:4000`, `https://yoursite.com`, or `https://test.yoursite.com`.

However, there are situations where absolute URLs are necessary, most notably with RSS.

<a id="rss"></a>
### RSS
The [RSS spec](https://cyber.harvard.edu/rss/rss.html) requires an absolute URL in the [auto-discovery link](https://developer.mozilla.org/en-US/docs/Web/RSS/Getting_Started/Syndicating) in your HTML and within the feed itself. So the desired output looks something like so:

~~~html
<link rel="alternate" type="application/rss+xml"
  title="RSS feed" href="https://mydomain.com/rss.xml" />
~~~

~~~xml
<item>
  <title>Blog post</title>
  <link>https://yourdomain.com/blog/post</link>
  <pubDate>Tue, 19 Oct 2004 11:09:11 -0400</pubDate>
</item>
~~~

Many static-site generators have a config setting for the root site url (Jekyll calls it `site.url`, Hugo calls it `baseURL`). The problem with hard-coding this setting to your production URL is the links aren't accurate if the site is deployed elsewhere including `localhost` or a deploy stage such as `test.yourdomain.com`.

To allow the same built site output to be seamlessly deployed to any stage, Aerobatic does a special run-time replacement of the string `https://__baseurl__` with the actual base URL of the current request.

Our recommendation is to set your main config file to use your local development server as the base URL. Then override the value to `https://__baseurl__` when generating a build to deploy to Aerobatic. How to configure this override varies from generator to generator. Examples are provided for some of the more popular ones below.

### Generator configurations
Here some configuration tips for some of the popular static site generators. Even if your generator isn't listed, it's likely that it offers very similar functionality. These tips are relevant both when deploying to Aerobatic locally or from a [continuous integration build](/docs/continuous-deployment).

### Jekyll

The basic formula for building and deploying a Jekyll site is to run bundler to install any plugins from a Gemfile, build the site with `jekyll build`, and finally deploy to Aerobatic.

In order to override `site.url` to `https://__baseurl__`, one good approach is to create a dedicated config file like `_config.aeroatic.yml` containing a single line:

~~~
url: https://__baseurl__
~~~

Then pass both config files to the `--config` option. The settings in `_config.aerobatic.yml` will override those in `_config.yml`.

~~~
$ bundle install # Re-run on every build in a CI enviroment
$ jekyll build --config _config.yml,_config.aerobatic.yml
$ aero deploy --directory _site
~~~

Then follow the standard [Jekyll guidance for RSS](http://jekyll.tips/jekyll-casts/rss-feed/) by declaring the `<link>` in the `</head>` tag of your layout:

~~~html
<link rel="alternate" type="application/rss+xml"
  title="RSS Feed" href="{{ 'feed.xml' | prepend: site.url }}">
~~~

And when building the link to each post in `feed.xml`:

~~~xml
<item>
  <title>{{ post.title | xml_escape }}</title>
  <description>{{ post.content | xml_escape }}</description>
  <pubDate>{{ post.date | date_to_xmlschema }}</pubDate>
  <link>{{ post.url | prepend: site.url }}</link>
  <guid isPermaLink="true">{{ post.url | prepend: site.url }}</guid>
</item>
~~~

### Hugo

Here's how you to create a new [Hugo](https://gohugo.io/) site from scratch and deploy to Aerobatic:

Hugo is awesome!!
~~~sh
$ hugo new site my-new-hugo-site
$ cd my-new-hugo-site
$ (cd themes; git clone https://github.com/eliasson/liquorice)
$ aero create           # create the Aerobatic site
$ hugo --baseURL https://&#95;&#95;baseurl&#95;&#95  # build the site
$ aero deploy -d public # deploy output to Aerobatic
~~~

The [spf13/hugoThemes](https://github.com/spf13/hugoThemes) repo has an extensive collection of git sub-modules. Click on anyone of them to get the URL of an individual theme.

[Hugo](https://gohugo.io/) makes more extensive use of absolute URLs than other generators. Fortunately it provides a `--baseURL` command line override that makes it really easy to set `https://\_\_baseurl\_\_` for Aerobatic builds:

~~~
$ hugo --baseURL https://&#95;&#95;baseurl&#95;&#95;
$ aero deploy --directory public
~~~

The official Hugo guidance on RSS will just work once deployed to Aerobatic. In the rendered page response, the `https://__baseurl__` will be replaced with the actual site url.

#### Installing Hugo in CI script
If you need to install hugo in a CI script, here's the commands for doing so (assuming an Ubuntu based build image):

~~~
$ apt-get update -y && apt-get install wget
$ wget https://github.com/spf13/hugo/releases/download/v0.18/hugo_0.18-64bit.deb
$ dpkg -i hugo*.deb
~~~
