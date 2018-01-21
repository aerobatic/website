---
title: Host Kibana On A CDN Using Bitbucket And Aerobatic
subtitle:
layout: post
comments: true
date: 2015-09-08
slug: kibana-static-on-aerobatic
description: How to create an ElasticSearch cluster and deploy Kibana Static to a CDN for faster performance.
tags:
---

ElasticSearch is an awesome open-source project that helps developers index data and make it almost instantly queryable. [Elastic.co](https://www.elastic.co/) is the company behind ElasticSearch as well as a visualization tool called [Kibana](https://www.elastic.co/products/kibana) that is purpose-built to report on top of ElasticSearch indexes.

In this post, we'll show you how to host your own _static version_ of Kibana 4 that connects to an ElasticSearch cluster. Running a static instance of Kibana means reduced complexity from not having to think about server-side code, as well as being able to push Kibana assets onto a CDN for faster performance. There is already a community-contributed, [static version of Kibana](https://github.com/kibana-community/kibana4-static). We're going to modify it slightly and host it using the Aerobatic add-on for Bitbucket.

<iframe src="http://kibanashakes.aerobaticapp.com/#/dashboard/Kibanashakes?embed&_a=(filters:!(),panels:!((col:7,id:King-Mentions-by-Play,row:1,size_x:6,size_y:6,type:visualization),(col:1,id:Count-of-Speakers,row:1,size_x:6,size_y:6,type:visualization)),query:(query_string:(analyze_wildcard:!t,query:'*')),title:Kibanashakes)&_g=()" height="600" width="800"></iframe>

### Create an ElasticSearch Cluster

If you don't already have an ElasticSearch cluster to connect to, Elastic.co offers a paid ElasticSearch as a Service called [Found.no](https://www.found.no/) and provides a 14 day free trial. It's simple to get started and takes just a few minutes. Another option is to [install ElasticSearch on Digital Ocean](https://www.digitalocean.com/community/tutorials/how-to-install-elasticsearch-logstash-and-kibana-4-on-ubuntu-14-04).

Either way, once your ElasticSearch endpoints have been provisioned, you're then ready to import data.

### Import Data

There's an excellent [10 minute walkthru](https://www.elastic.co/guide/en/kibana/3.0/using-kibana-for-the-first-time.html) on getting started with Kibana on the Elastic.co site. In that walkthru, there is a section on importing data into your ElasticSearch cluster.

Specifically, we're going to load the complete works of Shakespeare into our ElasticSearch cluster. So, go ahead and download the complete works that are already in an ElasticSearch bulk import format: [shakespeare.json](https://www.elastic.co/guide/en/kibana/3.0/snippets/shakespeare.json)

Now that we have our data, in your terminal, run the following to create the index mapping, making sure to replace `http://localhost:9200` with your ElasticSearch instance's URL.

```sh
curl -XPUT http://localhost:9200/shakespeare -d '
{
 "mappings" : {
  "_default_" : {
   "properties" : {
    "speaker" : {"type": "string", "index" : "not_analyzed" },
    "play_name" : {"type": "string", "index" : "not_analyzed" },
    "line_id" : { "type" : "integer" },
    "speech_number" : { "type" : "integer" }
   }
  }
 }
}
';
```

With the mapping created, we can then import the data. First of all `cd` into the directory where you stored your `shakespeare.json` file and then run the following from the terminal:

```sh
$ curl -XPUT localhost:9200/_bulk --data-binary @shakespeare.json
```

### Clone Kibana4 Static

As previously mentioned, the slightly modified Aerobatic version of Kibana4Static is based on the original [Kibana4Static](https://github.com/kibana-community/kibana4-static) version with a couple of modifications that we'll cover in a moment.

From the terminal, either fork or clone the repo:

```sh
$ git clone git@bitbucket.org:dundonian/kibanashakes.git
```

### package.json

The `_aerobatic` block in the `package.json` file of this repository serves as a manifest for apps that are hosted on Aerobatic. You'll notice that we're using a module called the `express-request-proxy`. This is an Aerobatic plugin that acts as an API proxy. In the proxy, we are referencing an environment variable - `$ELASTICSEARCH_URL`. In a moment, you'll set your own environment variable value in the Bitbucket UI. This will contain the URL to your ElasticSearch cluster.

```json
{
  "name": "kibanashakes",
  "version": "0.0.1",
  "_aerobatic": {
    "baseDir": "public",
    "router": [
      {
        "module": "express-request-proxy",
        "path": "/elasticsearch/:path1?/:path2?/:path3?/:path4?/:path5?",
        "method": "all",
        "options": {
          "url": "$ELASTICSEARCH_URL"
        }
      },
      {
        "module": "webpage"
      }
    ]
  }
}
```

As for other differences from the original Kibana4Static repo:

* In `require.config.js`, we've added an additional line `baseUrl: __4front__.staticAssetPath,`
* In `config.js`, ElasticSearch is being directed through the express request proxy `"elasticsearch": location.protocol + "//" + location.hostname + "/elasticsearch"`

### Link Kibana Static to Aerobatic

You'll need to host your code repo on [Bitbucket](https://bitbucket.org) to take advantage of the Aerobatic add-on for Bitbucket. Once your repo is in Bitbucket, you'll then link it to Aerobatic. If you haven't done this before, you'll first of all [install the Aerobatic add-on for Bitbucket](https://bitbucket.org/account/addon-directory/) from the add-on directory.

Then, link the repo to Aerobatic, making sure to specify that the deploy directory is `/public` (this is where your index.html is), and check the "Yes, deploy my site now!" option.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/kibana/linkrepo.png">

At this point, your Kibana Static site is almost ready. The last thing we have to do is add our environment variable.

### Set ElasticSearch URL Environment Variable

In the Bitbucket UI, click _Settings_ and then in the Aerobatic section, click _App Settings_. In the _Key_ input box, name your environment variable `ELASTICSEARCH_URL` (you can call it anything so long as it matches the same name in `package.json`). Then, in the _Value_ input box, you'll give it the actual URL of your ElasticSearch cluster e.g. `http://192.168.1.1:9200/:path1?/:path2?/:path3?/:path4?/:path5?`. Make sure to copy everything as is after the port number.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/kibana/envvar.png">

### Wrap-Up

At this point, your Kibana site is now live, hosted on Aerobatic, fronted by a CDN and available via HTTPS. You can go further by [adding custom error pages](https://aerobatic.atlassian.net/wiki/pages/viewpage.action?pageId=5177349), or [adding a custom domain](https://aerobatic.atlassian.net/wiki/pages/viewpage.action?pageId=2097187). In the future, you'll also be able to authenticate users of your Kibana app using additional Aerobatic plugins without needing to write your own server-side code. If this is something you'd be interested in, we'd [love to hear from you](https://aerobatic.atlassian.net/servicedesk/customer/portal/1).

* The demo version of this app can be found at [http://kibanashakes.aerobaticapp.com/](http://kibanashakes.aerobaticapp.com/)
* The repo for this tutorial can be found at [https://bitbucket.org/dundonian/kibanashakes/src](https://bitbucket.org/dundonian/kibanashakes/src)
* The original Kibana4Static repo is on Github at [https://github.com/kibana-community/kibana4-static](https://github.com/kibana-community/kibana4-static) with special thanks to Github user [Asimov4](https://github.com/Asimov4)
