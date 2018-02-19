---
title: Implementing full-text search for Hugo sites
description: This new keyword-search plugin makes it super easy to add search to your site. This post specifically dives into how to set it up for a Hugo site.
date: 2017-05-11
tags: hugo, search, keyword-search
slug: full-text-search-for-hugo-sites
---

<img src="/img/search-scan-icon.png" style="float:right; max-width: 200px;"></img>
At Aerobatic we're big fans of Hugo. The site you're looking at right now is built with Hugo. While Hugo's ability to generate reams of HTML pages from markdown content is unsurpassed, what about when you need to search all that content to find what you are looking for fast? One solution _was_ to use GSS (Google Site Search) but it was difficult to theme nicely and injected ads. I say "was" because Google has annouced it is [shutting the product down](https://enterprise.google.com/search/products/gss.html) next year. [Algolia](https://algolia.com) is a powerful service, but it's a separate dependency to manage and subscribe to, and requires custom code to be written and maintained to regularly crawl and index your site content.

In this post we'll walkthrough how to use the Aerobatic [keyword-search](/docs/plugins/keyword-search/) plugin to power a fully customized search feature for a Hugo site. Once configured, Aerobatic will automatically re-index your site with each deployment &mdash; no APIs to wire up. The only coding required is implementing a search `<form>` in your master layout and a [Mustache](https://mustache.github.io/) template to format the search results.

You can have full text search up and running from scratch in **30 minutes or less**. **Let's get started!**

The demo site along with full source code is available for you to clone and follow along.

* Demo site: https://hugo-search-demo.aerobaticapp.com
* Source code: https://github.com/aerobatic/hugo-search-demo

You can clone the demo repo and deploy it to your own account as a new website by following the directions in the README.

## Site content

Our demo site uses classic poems as the content to be searched. Each poem is a markdown file with some TOML frontmatter that declares a description (in this case the first few lines of the poem). Hugo allows declaring additional arbitrary metadata here which we'll use to set the author and year the poem was written. This same approach of course works for blog posts, but really any type of content is fair game. For example an ecommerce site could use a markdown file for each product in the catalog with metadata such as price, category, image, etc. declared in frontmatter.

Here's a portion of [the-raven.md](https://github.com/aerobatic/hugo-search-demo/blob/master/content/post/the-raven.md):

```text
+++
title = "The Raven"
author = "Edgar Allan Poe"
description = "Once upon a midnight dreary, while I pondered, weak and weary, Over many a quaint and curious volume of forgotten..."
year = "1845"
menu = "main"
+++

Once upon a midnight dreary, while I pondered, weak and weary,
Over many a quaint and curious volume of forgotten lore,
While I nodded, nearly napping, suddenly there came a tapping,
As of some one gently rapping, rapping at my chamber door.
“‘Tis some visiter,” I muttered, “tapping at my chamber door—
                          Only this, and nothing more.”
```

## Enable the keyword-search plugin

Now we need to enable the keyword search plugin in the aerobatic.yml manifest. Add an entry in the `plugins` array for `keyword-search`. This should appear **_above_** the [webpage](/docs/plugins/webpage/) plugin. To learn more about how plugins work and are configured, see the [plugin docs](/docs/configuration/#plugins).

The `path` property is the URL (relative to your website base url) where the search results will be displayed. The path name can be whatever you like, but be sure to include the trailing slash. This is due to the way Hugo generates `index.html` files within a directory corresponding to the file name. The `resultsTemplate` and `mustacheTags` properties will be explained shortly.

```yaml
plugins:
  - name: keyword-search
    path: /search/
    method: get
    options:
      resultsTemplate: search/index.html
      mustacheTags: ['<%=', '%>']

  - name: webpage
```

We also need a separate YAML config section called `scanner`. This section controls how your site is crawled and indexed after each deployment. The `metadataKeys` property will be explained in just a bit. You can find details on the other options in the [keyword-search docs](/docs/plugins/keyword-search/#options).

```yaml
scanner:
  keywordSearch:
    contentSelectors:
      - .content p
    noIndexPatterns:
      - /search/**
    titleStripEnd: " | Aerobatic Hugo Search Demo"
    metadataKeys:
      - description
      - author
      - year
```

That's it for configuration. We could actually omit the `options` section from the `keyword-search` declaration and run `aero deploy` right now. The content of the site would get indexed and the default search results template rendered at `https://your-site.aerobaticapp.com/search/`. If you are following along with your own website, it's probably a good idea to go ahead and do that now to test it out.

For this demo we're going to customize the search results template so it feels like a completely integral part of the site. We'll tackle that next.

## Customizing the search results

For this we need to create a new file at `content/search.html`. Here's where things get ever so slightly tricky. Aerobatic expects a [Mustache](https://mustache.github.io/) template on the server to pass the raw search results to. The default Mustache delimiters are double curly braces (thus the mustache moniker). Trouble is those are the same delimiters Go templates use to demark partials, shortcodes, etc. and we need to ensure that Hugo doesn't attempt to process these when the site is built. Fortunately there's an easy solution to this which is to override the `mustacheTags` option. We recommend using ERB style delimiters (`<%= %>`) since they a standard syntax and are visually distinct enough from curly braces that it's clear which delimiters are for Hugo and which are for Aerobatic.

The template will be bound on Aerobatic to a data object containing the search results. This data object can be seen by running the following curl command:

{{<cli "curl -H 'Accept:application/json' https://hugo-search-demo.aerobaticapp.com/search/?q=raven">}}

Which returns:

```json
{
  "searchTerm": "raven",
  "zeroResults": false,
  "searchResults": [
    {
      "description":
        "Once upon a midnight dreary, while I pondered, weak and weary, Over many a quaint and curious volume of forgotten...",
      "author": "Edgar Allan Poe",
      "year": "1845",
      "title": "The Raven",
      "snippet":
        "And the <em>raven</em>, never flitting, still is sitting, still is sitting On the pallid bust of Pallas just above my chamber door; And his eyes have all the s",
      "score": 25.23,
      "urlPath": "/post/the-raven/",
      "fullUrl": "https://hugo-search-demo.aerobaticapp.com/post/the-raven/"
    }
  ]
}
```

Using the ERB style delimiters our `search.html` looks like this:

```html
+++
title = "Search"
description = "Search the site"
+++

{{ partial "header" . }}
{{ partial "nav" . }}
<section class="section">
  <div class="container">
    <h3>Search results for "<%= searchTerm %>"</h3>
    <%= #searchResults %>
      <article>
        <div class="title"><a href="<%= &urlPath %>"><%= title %></a></div>
        <div class="author">By <%= author %> &mdash; <%= year %></div>
        <div class="summary"><%= &snippet %></div>
      </article>
    <%= /searchResults %>

    <%= #zeroResults %>
    <h3>No Results</h3>
    <%= /zeroResults %>
  </div>
</section>
{{ partial "footer" . }}
```

Note the extra "&" prefix on `&snippet` and `&urlPath`. This is used to unescape the value. We are able to utilize the same CSS classes that are used in the main list of poems on the home page. The bottom line is it's your code so you have complete freedom to format and style the search results **exactly the way you want**.

Here's what our custom search results looks like (which you can see for real at [https://hugo-search-demo.aerobaticapp.com/search/?q=winter](https://hugo-search-demo.aerobaticapp.com/search/?q=winter)).

<img alt="Search results screenshot" src="https://www.aerobatic.com/media/blog/hugo-search-demo-screenshot.png" style="border: solid 1px #ccc" />

The `resultsTemplate` option is set to the **output path** of the search file. Remember Aerobatic knows nothing about the Hugo directory structure, only the output written to the `/public` directory that gets deployed. Therefore `resultsTemplate` is set to "/search/index.html".

Here again for reference are the plugin options:

```yaml
options:
  resultsTemplate: search/index.html
  mustacheTags: ['<%=', '%>']
```

## Creating the search box

Now we have a way to display custom formatted search results, but we haven't actually create a search form for users to enter their query. Oftentimes the search box is right in the global header so it is available from every page on the site. In [nav.html](https://github.com/aerobatic/hugo-search-demo/blob/master/layouts/partials/nav.html) the following basic html form does the trick:

```html
<form class="search" method="get" action="/search/">
  <input type="text" name="q" placeholder="Search poems">
</form>
```

## Metadata

In the data object bound to the template, each search result includes the properties `author` and `year`. By default these properties would not be present, but we've done a couple of things to make them available to search results. The first thing, which was mentioned earlier, is to declare these attributes in the frontmatter for each poem. But we still need a way to expose these values to the Aerobatic crawler since it only sees the final rendered pages. For this we can render a meta tag in the `<head>` of each page. This is done in [layouts/partials/header.html](https://github.com/aerobatic/hugo-search-demo/blob/master/layouts/partials/header.html):

```html
<!-- Metadata for the Aerobatic scanner to index -->
{{ if .Params.description }}<meta name="description" content="{{ .Params.description }}" />{{ end }}
{{ if .Params.author }}<meta name="author" content="{{ .Params.author }}" />{{ end }}
{{ if .Params.year }}<meta name="year" content="{{ .Params.year }}" />{{ end }}
```

Finally we need to inform the Aerobatic crawler to look for these meta tags and add them to the search index. This is done by setting the `metadataKeys` property:

```yaml
scanner:
  keywordSearch:
    metadataKeys:
      - description
      - author
      - year
```

In addition to displaying the metadata next to each search result, you can also search on it. For example: https://hugo-search-demo.aerobaticapp.com/search/?q=1922.

## Sitemap

A cool thing about Hugo is you get a `sitemap.xml` out of the box. The Aerobatic crawler looks for a sitemap to help discover all the URLs on the site. So even if all the poems were not listed on the home page they will still get crawled since Hugo will list them in the sitemap.

## Conclusion

That's all there is to it: a search box, a search results template, and a bit of configuration in `aerobatic.yml`. Once that's in place your site will automatically be re-indexed everytime you deploy &mdash; ensuring that search results will always reflect the latest and greatest content. If you have more than just a few pages of content on your site, you should really consider adding a search feature. Aerobatic is the only static hosting platform with built-in keyword search which makes getting up and running easier than ever.

If you are interested in enhancing the capabilities of your Hugo site further, take a look at some of [our other plugins](/docs/plugins/). For example, you can combine keyword search with the [password-protect](/docs/plugins/password-protect) plugin to offer search on a private site.

As always, happy coding!
