---
title: Continuous build and deployment of Jekyll sites
description: Now you don't have to commit your _site directory to Bitbucket. We'll automatically run jekyll build and push the compiled output.
slug: automated-continuous-deployment-of-jekyll-sites
comments: true
date: 2016-03-02
tags: jekyll, static site generator, cd
---

{{% alert warning %}}
**OUT OF DATE** This blog post refers to a deprecated way of interfacing with Aerobatic. For up to date information on continuous deployment of Jekyll sites, please see these articles:

* [Deploy a Jekyll site to Aerobatic](/docs/static-site-generators/#jekyll)
* [Continuous Deployment of a Jekyll Site with Travis CI and Aerobatic](/blog/jekyll-travis-github-aerobatic/)
{{% /alert %}}

<div style="text-align: center; margin-bottom: 20px;">
<img src="////www.aerobatic.com/media/logos/jekyll.png" style="max-width: 100%; max-height: 200px;">
</div>

We're excited to announce that deploying and hosting [Jekyll](https://jekyllrb.com/) sites on Aerobatic just got a whole lot better! Starting today we'll automatically **build your site for you** as part of our continuous deployment pipeline. No more having to commit your `_site` folder to Bitbucket; leave it in `.gitignore` where it belongs. The webpage you are reading right now is an output of this process.

Additionally, and unlike GitHub pages, we support **custom ruby plugins**. [Plugins](https://jekyllrb.com/docs/plugins/) are a great way to extend the core functionality of Jekyll. There's a [growing ecosystem](http://www.jekyll-plugins.com/) of plugins to do things like: [tagging](http://www.jekyll-plugins.com/plugins/jekyll-tagging), [search](http://www.jekyll-plugins.com/plugins/simple-jekyll-search), [slideshows](http://www.jekyll-plugins.com/plugins/jekyll-slideshow), [embedding tweets](http://www.jekyll-plugins.com/plugins/jekyll-tweet-tag), and much more.

You can also leverage plugins to encapsulate your own reusable widgets to ease content authoring and cut down on code duplication. You can even bundle these plugins as a `gem` allowing for seamless reuse across multiple websites.

## Enabling Automated Builds
To inform the Aerobatic build process to use Jekyll, just declare the following snippet in your `package.json` [manifest](/docs/configuration#website-manifest):

~~~json
{
  "_aerobatic": {
    "build": {
      "engine": "jekyll"
    }
  }
}
~~~

The Aerobatic **Deployment settings** should specify the root directory `/` as the deployment target, **not** the `_site` directory (that shouldn't even be in the repo at all now).

In the Bitbucket add-on, you can view the Jekyll log output for each build/deployment:

## Plugins
You can declare Jekyll plugins one of two ways:

1. Ruby (`*.rb`) files located in the `_plugins` directory.
2. Declared in the `gems` array of `_config.yml`:

~~~text
gems: [jekyll-paginate, jekyll/tagging]
~~~

We don't currently support installing plugins from a `Gemfile`, you'll need to declare gems in `_config.yml`. We also don't support plugins with native extensions, however you **can** depend upon several popular native extension gems including `ffi`, `nokogiri`, `sass`, and `json` as they come pre-installed. See the [docs](docs/static-generators#jekyll) for full details.

## Backend Technology

Behind the scenes, Jekyll builds are powered by our same AWS Lambda based build/deployment pipeline.

<img src="//www.aerobatic.com/media/diagrams/lambda-deploy-diagram.png" class="screenshot"/>

[More details on how this works](/docs/static-generators#lambda-backend)

## A Simple Plugin
To illustrate the power of plugins, let's build one. Let's say you want content authors to be able to embed attention grabbing block quotes within markdown files. Here's a `Blockquote` plugin that allows options for including quote icons and a border. While this could be done with HTML/CSS, the plugin provides a more succinct syntax and abstracts away the underlying markup.

Just create a file `blockquote.rb` and place it in the `_plugins` directory with the following contents:

~~~ruby
class Blockquote < Liquid::Block
  def initialize(tagName, params, tokens)
    super

    args = params.split(' ')
    @show_icon = args.include?('icon')
    @show_border = args.include?('border')
  end

  def render(context)
    class_name = 'pretty-quote'
    class_name += ' icon' if @show_icon
    class_name += ' border' if @show_icon

    # Note the markdown=1 attribute
    "<blockquote class=\"#{class_name}\" markdown=\"1\">#{super}</blockquote>"
  end

  Liquid::Template.register_tag "quote", self
end
~~~

Now authors can declare the quote plugin in any markdown file:

~~~text
{% quote icon border %}
Here's a great quote with **markdown**.
{% endquote %}
~~~

You can imagine more complex features like passing in an avatar image and other styling flags. The ruby code would be responsible for inflating the short image name to a full URL, altering the markup within the `blockquote` tag, and so on.

## Content Editing Workflow
A great side effect of having Aerobatic do the builds is a more streamlined publishing workflow. Now you can add and edit markdown files directly in the Bitbucket browser interface, commit the changes, and trigger a new build/deployment &mdash; all without having to pull the repo down locally, edit files on your desktop, and push back to Bitbucket. A nice time saver for simple content changes.

This also starts to open the door for non-coders to be able to contribute to a Jekyll site without having to know anything about the command line, HTML, liquid templates, etc. As long as they can grok markdown and how to declare any custom plugins the development team has setup, they can maintain aspects of the site without any developer intervention. We realize this is still far from ideal and are actively looking at ways to further empower non-developers to reap the benefits of static site generators. Stay tuned for future announcements!

## Additional Static Site Generators
We started with Jekyll and Hugo, but there are plenty of great alternatives. Our plan is to provide the same first-class build support for other leading generators including: [Hexo](https://hexo.io/) and [Pelican](http://blog.getpelican.com/). We'd love to [hear your thoughts](https://aerobatic.atlassian.net/servicedesk/customer/portal/1).
