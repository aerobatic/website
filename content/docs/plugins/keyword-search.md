---
title: Keyword search plugin
plugin: true
name: keyword-search
description: The keyword-search plugin provides a way for users to search the content of your website.
---

# Keyword search plugin

The keyword search plugin provides full text search capabilities for your Aerobatic website. It works in conjunction with the [site scanner](/docs/configuration/#site-scanner) that crawls and examines your website content following each deployment. You can use our stock search template, or take full control with your own HTML template for a totally seamless user experience.

The search feature on this site is an example of the plugin at work. Also check out the [demo website](https://keyword-search-demo.aerobatic.io) with the full [source code](https://github.com/aerobatic/keyword-search-demo).

## Configuration

There are two parts to setting up keyword search:

1. Configure the `scanner` section of `aerobatic.yml` to enable keyword search
2. Configure the `keyword-search` plugin at a path such as `/search`

~~~yaml
plugins:
  - name: keyword-search
    path: /search
    method: get
      
scanner:
  keywordSearch: {}
~~~

The configuration above is all that is required to enable basic search on your site. With each new deployment, our scanner process will kick off and re-build your full text search index. A page will render when you browse to the configured endpoint (in this case `/search`) that looks like this:

![Basic Search Template Screenshot](https://www.aerobatic.com/media/docs/search-results-basic-screenshots.png)

### Options

**Plugin**

The following are the available options for the keyword-search plugin. **All options are optional**.

~~~yaml
plugins:
  - name: keyword-search
    path: /search
    options:
      resultsTemplate: '/search.html'
      queryParam: q
      maxResults: 10
      mustacheTags: ['<%=', '%>']
~~~

{{% option "resultsTemplate" %}}
The [custom Mustache template](#custom-search-results-template) for rendering your search results. By default search results are rendered using the generic built-in template.
{{% /option %}}

{{% option "queryParam" %}}
The name of the querystring parameter for the search term. This should be set as the `name` attribute of the search textbox tag. Defaults to `q`.
{{% /option %}}

{{% option "maxResults" %}}
The maximum number of search results to return. Defaults to `10`.
{{% /option %}}

{{% option "mustacheTags" %}}
Override the default mustache tags. The default is `['{{', '}}']`.
{{% /option %}}

**Site scanner**

The following options are for the `keywordSearch` object in the `scanner` section that control the site re-indexing process that is kicked off following a deployment. **All options are optional**.

~~~yaml
scanner:
  siteMapPath: /sitemap.xml
  keywordSearch:
    noIndexPatterns: [/private/**]
    titleStripStart: 'Sitename |'
    titleStripEnd: ' - Sitename'
    contentSelectors: [p, li]
    headerSelectors: [h1, h2],
    metadataKeys:
      - author
      - tags
      - description
~~~

{{% option "noIndexPatterns" %}}
The path patterns that should not be indexed.
{{% /option %}}

{{% option "siteMapPath" %}}
Override the path where the sitemap is located. Defaults to `/sitemap.xml`.
{{% /option %}}

{{% option "contentSelectors" %}}
The list of jQuery style selector strings that identify the blocks of content that should be indexed. Defaults to `[p, li]`. See [Controlling what is indexed](#controlling-what-is-indexed).
{{% /option %}}

{{% option "headerSelectors" %}}
The list of jQuery style selector strings that identify the content headers indexed. Defaults to `[h1, h2]`.
{{% /option %}}

{{% option "titleStripStart" %}}
String that should be stripped off the start of the `<title>`. See [Page title formatting](#page-title-formatting).
{{% /option %}}

{{% option "titleStripEnd" %}}
String that should be stripped off the end of the `<title>`.
{{% /option %}}

{{% option "metadataKeys" %}}
Names of metadata keys to scrape from the `<meta>` tags when building the keyword index. See the [metadata](#metadata) section for details.
{{% /option %}}

## How it works

The site-scanner starts by looking for a Sitemap at `/sitemap.xml`. If your sitemap URL is at a different path, you can override it in the [scanner config](/docs/configuration/#site-scanner):

~~~yaml
scanner:
  keywordSearch:
    siteMapPath: /sitemap
~~~

The set of URLs found in the sitemap along with the main index document at `/` serve as the starting point for the crawl. Any new URLs discovered along the way will be added to the queue. If you don't have a sitemap, then only pages that can be discovered from the home page will get crawled.

{{% alert tip %}}
**TIP:** Most popular static site generators will create a sitemap for you. See these resources for [hugo](https://gohugo.io/templates/sitemap/) and [Jekyll](https://github.com/jekyll/jekyll-sitemap). 
{{% /alert %}}

A jQuery style selector is run again the HTML of each page to extract the content that is written to the index. The elements we look for are the url path, the `<title>` tag, the `<meta name="description">` and `<h1>` and `<h2>` tags. Additionally the crawler scrapes the inner text from a configurable set of content selectors that identify the main body text of the page. The default set of selectors is `['p', 'li']` which will extract the content from all `<p>` and `<li>` elements.  The goal is to index the "meat" of the page content that will provide the most useful search results to the end user. Each search document written to the index take the following shape:

~~~json
{
  "path": "/blog/how-to-make-your-lawn-green",
  "title": "How to make your lawn the greenest on the block",
  "description": "These helpful tips will make your lawn lush all summer long and the envy of your neighbors",
  "headers": ["Mowing schedule", "Smart watering", "Regular maintenance"],
  "body": "matched content 1 matched content 2 matched content 3..."
}
~~~

At search time, each document is evaluated based on how well it matches the query term and assigned a search score based on the strength of the match. Each field is weighted differently so a keyword match in the `title` field is considered a stronger signal than a match in the `body` (of course the keywords in the title are likely repeated in the body). Search engines call this technique "query boosting". The top `maxResults` ordered by top score are returned. The boost level associated with each field is as follows:

* `path` - **5**
* `title` - **5**
*  Metadata, i.e. `description`, `author`, etc. - **3**
* `headers` - **2**
* `body` - **1**

### Controlling what is indexed
You can override the selectors that control what gets indexed. For example, let's say your site template wraps the main content of each page in a `<section id="main-content">`. Then you could configure the `site-scanner` like so:

~~~yaml
scanner:
  keywordSearch:
    contentSelectors: ['section#main-content p']
    headerSelectors: ['section#main-content h1', 'section#main-content h2']
~~~

You can also specify patterns for pages that you don't want to crawl at all using the `noIndexPatterns` property:

~~~yaml
scanner:
  keywordSearch:
    noIndexPatterns:
      - '/no-crawl/**'
      - '/also-dont-crawl/**'
~~~

### Result Snippets

Each search result will be displayed with a snippet of text that attempts to best match the search terms in order to provide the end user some additional context. The set of candidate snippets is discovered at the same time the content selectors are run during the indexing process. The first 150 characters of each matched content element are stored in the index as potential snippets.

At search time after the top 10 documents are discovered by the engine, a snippet selection is done for each. If at least one of the keywords is found in the document description (which comes from the `<meta name="description">` tag), then the description is used as the snippet. If the description does not contain any of the terms then whichever of the snippet candidates contains the most search terms is selected.

When rendered in the search template the matched terms in the snippet are wrapped in an `<em>` tag so they can be styled with CSS (making them bold is a standard practice).

### Search result dates

Links found in the sitemap with a `lastmod` element will appears in search results with a date. This is helpful for end users to know if the page was updated recently or not. Static site generators will typically set the `lastmod` in the generated sitemap based on a front matter property.

~~~xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.aerobatic.com/blog/introducing-website-metrics/</loc>
    <lastmod>2017-04-24T00:00:00+00:00</lastmod>
  </url>
<urlset>
~~~

### Metadata

The scanner can be configured to take the values of specific `<meta>` tags in the head of your pages. The metadata is stored in the search document both for searching on and to display alongside each search result. The list of metadata keys must be specified with the `metadataKeys` property:

~~~yaml
scanner:
  keywordSearch:
    metadataKeys:
      - author
      - description
      - category
~~~

Then you would need to make sure these values are emitted in the `<head>` of your pages:

~~~html
<head>
  <meta name="author" content="Author name" />
  <meta name="description" content="This is a description of the page" />
  <meta name="category" content="Blog" />
</head>
~~~

### Formatting page titles

It is sometimes customary for all `<title>` tag values to either start or end with the same company or site name. For search engines like Google, this makes sense as your results are combined with results from other sites on the internet and you want your name to stand out. However for internal site search repeating the company name on every result does not provide any value and leads to visual clutter. You can set the `titleStripStart` or `titleStripEnd` options to chop titles down to the true meaningful value.

For example if your actual page title is "Mighty Agency | Our Philosophy" then you could configure the scanner like so:

~~~yaml
scanner:
  keywordSearch:
    titleStripStart: "Mighty Agency | "
~~~

This page will then appear in search results with the title "Our Philosophy".

## Custom search input box
The default search results template provides a search box. So you could just include a link in your site navigation to `/search` (or whatever `path` you specified in the plugin declaration). However it's also possible to have a search form on any other page in your site, or on every page in the global header. Just declare a standard HTML form like so:

~~~html
<form method="GET" action="/search">
  <input type="text" name="q" />
  <button type="submit">Search</button>
</form>
~~~

Here's a working example:

<form method="GET" action="/search">
  <div class="input-group">
    <input class="form-control input-lg" name="q" type="text" placeholder="Search Aerobatic" />
    <span class="input-group-addon"><i class="fa fa-search"></i></span>
  </div>
</form>

## Custom search results template

In order to fully control how search results are rendered in your site you can configure a custom template with the `resultsTemplate` option:

~~~yaml
plugins:
  - name: keyword-search
    path: /search
    options:
      resultsTemplate: search.html
~~~

The html file is actually a [Mustache](https://mustache.github.io/) template which allows you to define the HTML markup for each search result in the context of your site header, footer, navigation, css, and so on. Your search results page **will look just like any other page on your site**. The plugin will feed your template a JSON object with this format:

~~~json
{
  "searchTerm": "jekyll",
  "zeroResults": false,
  "searchResults": [
    {
      "title": "How To Password Protect A Jekyll Site",
      "snippet":"Add a login page to a <em>Jekyll</em> site in a few minutes...",
      "score":21.82,
      "urlPath":"/blog/password-protect-a-jekyll-site/",
      "date":"Feb 18, 2017","fullUrl":"https://www.aerobatic.com/blog/password-protect-a-jekyll-site/"
    },
    ...
  ]
}
~~~

The JSON is the same as what is returned when running a [JSON search](/#json-search-results). You can see an actual search response by running:

~~~sh
[$] curl -H 'Accept:application/json' https://www.aerobatic.com/search?q=jekyll
~~~

Here is an example of a basic search results template:

~~~html
<body>
  <form method="GET" action="/search">
    <input class="u-full-width" type="text" required name="q" value="{{{searchTerm}}}">
    <button class="button-primary" type="submit">Search</button>
  </form>

  <div class="search-results">
    {{#searchResults}}
      <div class="search-result">
        <h3><a href="{{{urlPath}}}">{{title}}</a></h3>
        <cite>{{fullUrl}}</cite>
        {{#snippet}}
        <span class="snippet">{{#date}}{{date}} - {{/date}}{{{snippet}}}</span>
        {{/snippet}}
      </div>
    {{/searchResults}}

    {{#zeroResults}}
      <h4>No results</h4>
    {{/zeroResults}}
  </div>
</body>
~~~

{{% alert tip %}}
**TIP** Note the triple `{{{}}}` delimiters around the `snippet` and `urlPath`. This is how Mustache unescapes the output. This is necessary for the snippet since it contains `<em>` tags highligting keyword matches. When using custom Mustache tags you can unescape with syntax like this: `<%= &snippet %>`.
{{% /alert %}}

The [keyword-search-demo](https://keyword-search-demo.aerobatic.io) has a working example with source code.

### Use with a static site generator
To use a custom search results template with a static site generator like Hugo or Jekyll, you just need to make the `search.html` file is emitted to the build output directory. One issue that could arise is a conflict between the mustache delimiters `{{}}` and the generator's template syntax. For example Hugo uses [Go Templates](https://gohugo.io/templates/go-templates/) which also use the double curly delimiters. To avoid this you can override the mustache tags, maybe to the ERB style syntax:

~~~yaml
plugins:
  - name: keyword-search
    path: /search
    options:
      mustacheTags: ['<%=', '%>']
~~~

For a tutorial on how to use keyword-search for a Hugo site, see our blog post [Implementing full-text search for Hugo sites
](/blog/full-text-search-for-hugo-sites/).

### Testing custom template locally
In order to test your search results template locally the best approach is to hardcode some HTML in your template that matches the output of the mustache template. Then you can fine tune your HTML and CSS to get everything looking the way you like. Then make sure your mustache tags will emit the same HTML when populated by actual search results and comment out the hardcoded block.

## JSON search results
Rather than loading a dedicated search results page, you can also execute searches via an AJAX call. In this model you don't need a `resultsTemplate` since your client JavaScript will be responsible for rendering the JSON response. In order to inform the plugin that you want back JSON rather than HTML results, you need to pass the `Accept: application/json` header. If you are using jQuery, you can make the call like so:

~~~js
$.ajax({
  url: '/search',
  data: {q: searchTerm},
  dataType: 'json'
})
~~~

## Password protected sites
Sites using the [password-protect](/docs/plugins/password-protect/) plugin can also use the keyword search plugin. Just be sure to set the `path` of the search plugin within the protected portion of the site to avoid exposing search result summaries to non-logged in users (although they would be forced to enter the password if they clicked on the search result link).

## Limits
The following table summarizes limits enforced when building the search index:
If the text of the matched element is less than 50 characters it is not written to the index. Additionally only the first 1000 characters of each.

| Description   | Limit |
| ------------- | --------- |
| Maximum number of text characters from each matched content selector written to index | 1000 |
| Maximum number of content selector matches in a single page to include in the index | 20 |
| Maximum snippet length | 150 |
| Maximum website pages crawled and added to search index | 1000 |
