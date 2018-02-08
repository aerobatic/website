---
title: Building a reveal.js presentation with Jekyll Collections
description: How to use reveal.js and Jekyll collections to create HTML presentations
slug: jekyll-revealjs
comments: true
date: 2016-04-24
tags: jekyll, static site generator, revealjs
---

[Reveal.js](http://lab.hakim.se/reveal-js/#/) is an open-source HTML presentation framework. In this tutorial, we'll combine [Jekyll](http://jekyllrb.com/) and reveal.js to create our presentation. While this has been done before using various approaches, in this scenario, we'll take advantage of [Jekyll collections](https://jekyllrb.com/docs/collections/) to build our slides.

## Getting Started

If you don't already have a Jekyll site, go ahead and grab one of the [Jekyll themes](http://jekyllthemes.org/) and [host it with Aerobatic](https://www.aerobatic.com/docs/automated-builds#jekyll).

Next, download the [latest version](https://github.com/hakimel/reveal.js/releases) of reveal.js and add it to the root of your Jekyll site e.g. `<root directory>/reveal.js/`

## Slide layout

In the `_layouts` directory, create a new file called `slides.html`. The content of this new file will be as below (note: we're [reusing a layout](https://gist.github.com/luugiathuy/c07ac5608addadb642e5) previously created by [Luu Gia Thuy](https://github.com/luugiathuy)):

```html
{% raw %}
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">

    <title>
      {% if page.title %}
        {{ page.title }} | {{ site.title }}
      {% else %}
        {{ site.title }}
      {% endif %}
    </title>

    <meta name="author" content="{{ site.author }}" />

    <!-- Description -->
    {% if page.description %}
      <meta name="description" content="{{ page.description }}" />
    {% else %}
      <meta name="description" content="{{ site.description }}">
    {% endif %}

    <meta property="og:image" content="/opengraph-image.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, minimal-ui">

    <link rel="stylesheet" href="{{ "/reveal.js/css/reveal.css" | prepend: site.baseurl }}"/>
    {%if page.theme %}
      <link rel="stylesheet" href="{{ "/reveal.js/css/theme/" | prepend: site.baseurl | append: page.theme | append: '.css' }}" id="theme"/>
    {% else %}
      <link rel="stylesheet" href="{{ "/reveal.js/css/theme/black.css" | prepend: site.baseurl }}" id="theme"/>
    {% endif %}

    <!-- Code syntax highlighting -->
    <link rel="stylesheet" href="{{ "/reveal.js/lib/css/zenburn.css" | prepend: site.baseurl }}"/>

    <!-- Printing and PDF exports -->
    <script>
      var link = document.createElement( 'link' );
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = window.location.search.match( /print-pdf/gi ) ? '{{ "/reveal.js/css/print/pdf.css" | prepend: site.baseurl }}' : '{{ "/reveal.js/css/print/paper.css" | prepend: site.baseurl }}';
      document.getElementsByTagName( 'head' )[0].appendChild( link );
    </script>

    <link rel="apple-touch-icon" href="{{ "/apple-touch-icon.png" | prepend: site.baseurl }}" />

    <link rel="canonical" href="{{ page.url | replace:'index.html','' | prepend: site.baseurl | prepend: site.url }}">

    <!--[if lt IE 9]>
    <script src="lib/js/html5shiv.js"></script>
    <![endif]-->
  </head>

  <body>

    <div class="reveal">
      <div class="slides">
        {{ content }}
      </div>
    </div>

    <script src="{{ "/reveal.js/lib/js/head.min.js" | prepend: site.baseurl }}"></script>
    <script src="{{ "/reveal.js/js/reveal.js" | prepend: site.baseurl }}"></script>
    <script>
      // Full list of configuration options available at:
      // https://github.com/hakimel/reveal.js#configuration
      Reveal.initialize({
        controls: true,
        progress: true,
        history: true,
        center: true,
        {%if page.transition %}
          transition: '{{page.transition}}',
        {% else %}
          transition: 'slide', // none/fade/slide/convex/concave/zoom
        {% endif %}
        // Optional reveal.js plugins
        dependencies: [
          { src: '{{ "/reveal.js/lib/js/classList.js" | prepend: site.baseurl }}', condition: function() { return !document.body.classList; } },
          { src: '{{ "/reveal.js/plugin/markdown/marked.js" | prepend: site.baseurl }}', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
          { src: '{{ "/reveal.js/plugin/markdown/markdown.js" | prepend: site.baseurl }}', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
          { src: '{{ "/reveal.js/plugin/highlight/highlight.js" | prepend: site.baseurl }}', async: true, condition: function() { return !!document.querySelector( 'pre code' ); }, callback: function() { hljs.initHighlightingOnLoad(); } },
          { src: '{{ "/reveal.js/plugin/zoom-js/zoom.js" | prepend: site.baseurl }}', async: true },
          { src: '{{ "/reveal.js/plugin/notes/notes.js" | prepend: site.baseurl }}', async: true }
        ]
      });
    </script>

  </body>
</html>
{% endraw %}
```

## Slides Collection

Next, we'll declare a slides collection in our `_config.yml`:

```yaml
# Collections
collections:
  - slides
```

## Slides

In the root directory of your Jekyll site, create a new directory called `_slides`. This will be where we create our reveal.js slides. For example, create a new file called `1.md` and repeat for each slide you want to have:

```yaml
---
title: First Slide
---

## First slide heading

![Aerobatic logo](https://www.aerobatic.com/media/aerobatic-header-logo.png)
```

## Index.html

Lastly, we need to render our slides using the collection we've created. To do so, replace the contents of the `index.html` file in your root directory with the following:

```yaml
---
layout: slides
title: Jekyll and reveal.js
description: A presentation slide for how to use reveal.js in Jekyll
theme: white
transition: slide
---

{% raw %}
{% for slide in site.slides %}
<section>
    {{ slide.content }}
</section>
{% endfor %}
{% endraw %}
```

And that's a wrap. Commit your changes and Aerobatic will rebuild your site automatically!

## Summary

If you haven't hosted your sites before with Bitbucket and Aerobatic, it's easy to [get started](/docs/getting-started). We'll have your site live in less than a minute.

Here's a link to the [demo repo](https://bitbucket.org/aerobatic/jekyll-reveal/src), that we referenced in this tutorial.
