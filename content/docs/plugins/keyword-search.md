---
title: Keyword search plugin
plugin: true
name: keyword-search
---

# Keyword search plugin

## Configuration

semantic markup
sitemap location - dates, defaults to sitemap.xml

# Controlling what get's crawled

## JSON search results

Pass the `Accept: application/json` header

## Customizing HTML search results

### Testing locally

* Install mustache locally. 
* Create a file like `test-search-results.json`
* Run curl to get some sample data to paste into

~~~
curl -H "Accept:application/json" https://keyword-search-demo.aerobatic.io/search?q=precious | pyth
on -m json.tool > test-search-results.json
~~~

### Override mustache tags

