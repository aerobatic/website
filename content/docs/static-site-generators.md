---
title: Static site generators
name: static-site-generators
---

# Static site generators

Aerobatic is a perfect hosting complement to static site generators such as [Jekyll](https://jekyllrb.com/), Hugo, Middleman and others. Simply configure `aerobatic-cli` to deploy the directory where the generator emits the built site (`_site`, `public`, `dist`, etc.).

There are two ways to configure the deploy directory:

* Add a `deploy` section to your `aerobatic.yml` with a `directory` prop:

  {{< highlight yaml >}}
  deploy:
    directory: _site{{< /highlight >}}

  With this approach you just run `aero deploy` to deploy your site.

* **Or**, pass a command line option:

  ~~~sh
  [$] aero deploy --directory _site
  # or
  [$] aero deploy -d _site
  ~~~

Full docs on the [deploy command](/docs/cli/#deploy)

### Configuring the site url {#configuring-site-url}
In general we suggest using relative URLs in your template files since the browser will automatically resolve them to the current host and protocol. For example:

~~~html
<!-- Prefer this: -->
<a href="/about/contact">Contact Us</a>
<!-- Over this: -->
<a href="https://yoursite.com/about/contact">Contact Us</a>
~~~

That way the same markup will function identically no matter where what the base host is, i.e. `http://localhost:4000`, `https://yoursite.com`, or `https://test.yoursite.com`.

However, most static site generators have a `url` or `baseURL` config setting that is used to build an absolute URL. You could hardcode this value to your production URL, but then it won't automatically adjust when you push the version from one stage to another, i.e. `www--test.domain.com` to `www.domain.com`. If you are going to be taking advantage of [deploy stages](/overview/#deploy-stages), we recommend that you specify the reserved value <span class="code">https://&#95;&#95;baseurl&#95;&#95;</span> which Aerobatic substitutes at render time with the actual requested site url. We offer ways to configure this for specific generators below.

### Generator configurations
Here some configuration tips for some of the popular static site generators. Even if your generator isn't listed, it's likely that it offers very similar functionality. These tips are relevant both when deploying to Aerobatic locally or from a [continuous integration build](/docs/continuous-deployment/).

### Jekyll



The basic formula for building and deploying a Jekyll site is to run bundler to install any plugins from a Gemfile, build the site with `jekyll build`, and finally deploy to Aerobatic.

In order to override `site.url` to <span class="code">https://&#95;&#95;baseurl&#95;&#95;</span>, one good approach is to create a dedicated config file like `_config.aerobatic.yml` containing a single line:

~~~text
url: https://&#95;&#95;baseurl&#95;&#95;
~~~

Then pass both config files to the `--config` option. The settings in `_config.aerobatic.yml` will override those in `_config.yml`.

~~~sh
[$] bundle install # Re-run on every build in a CI enviroment
[$] jekyll build --config _config.yml,_config.aerobatic.yml
[$] aero deploy --directory _site
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

~~~sh
[$] hugo new site my-new-hugo-site
[$] cd my-new-hugo-site
[$] (cd themes; git clone https://github.com/eliasson/liquorice)
[$] aero create           # create the Aerobatic site
[$] hugo --baseURL https://&#95;&#95;baseurl&#95;&#95  # build the site
[$] aero deploy -d public # deploy output to Aerobatic
~~~

The [spf13/hugoThemes](https://github.com/spf13/hugoThemes) repo has an extensive collection of git sub-modules. Click on anyone of them to get the URL of an individual theme.

[Hugo](https://gohugo.io/) makes more extensive use of absolute URLs than other generators. Fortunately it provides a `--baseURL` command line override that makes it really easy to set <span class="code">https://&#95;&#95;baseurl&#95;&#95;</span> for Aerobatic builds:

~~~sh
[$] hugo --baseURL https://&#95;&#95;baseurl&#95;&#95;
[$] aero deploy --directory public
~~~

The official Hugo guidance on RSS will just work once deployed to Aerobatic. In the rendered page response, the <span class="code">https://&#95;&#95;baseurl&#95;&#95;</span> will be replaced with the actual site url.

#### Installing Hugo in CI script
If you need to install hugo in a CI script, here's the commands for doing so (assuming an Ubuntu based build image):

~~~sh
[$] apt-get update -y && apt-get install wget
[$] wget https://github.com/spf13/hugo/releases/download/v0.18/hugo_0.18-64bit.deb
[$] dpkg -i hugo*.deb
~~~
