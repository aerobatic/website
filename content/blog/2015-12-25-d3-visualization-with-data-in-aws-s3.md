---
title: Create A D3.js Visualization With Data from AWS S3
description: How to create d3 charts with large data files on AWS S3 instead of a git repo.
slug: d3-visualization-with-data-in-aws-s3
comments: true
date: 2015-12-25
tags: d3js, visualization, s3-proxy
---

<script script src="//d3js.org/d3.v3.min.js" charset="utf-8"></script>

[D3.js](http://d3js.org/) is a popular JavaScript library for manipulating documents based on data. A common pattern for working with d3 is to read in data from .csv, .tsv, or .json files. However, what happens when those data files are large? Storing them in a git repository alongside the code can be inefficient with the repo becoming bloated, and every push taking a long time.

A better solution would be to keep the data files separate from the code, and an ideal place for them is Amazon Web Services (AWS) Simple Storage Service (S3). Aerobatic makes it possible to take those data files in S3 and serve them from our global CDN with their own cache value that’s separate from the rest of the site’s code, using our [S3 proxy](/docs/s3-proxy) plugin. That way, your code is being updated instantly when you push to Bitbucket, while assets that change infrequently, such as your source data on S3, are not having their cache expired with each code deploy. Another benefit is that perhaps some other team at your company is responsible for publishing an updated daily data feed. Again, in this scenario, that team can publish to S3 without needing access to the site source code and having to republish the repo with the latest data file.

The rest of this post walks you through how to create a d3 visualization with a data file stored on S3. For this demo, we'll source our data from [Google AdWords API](https://developers.google.com/adwords/api/docs/appendix/geotargeting). The file is 6.4Mb and contains a list of all Geographical Targets that a Google AdWords campaign can be targeted against.

While 6.4Mb isn't exactly a huge file, this sort of setup becomes more important if you're working with multiple data files and / or larger datasets.

- The demo site can be found at [https://d3s3.aerobaticapp.com/](https://d3s3.aerobaticapp.com/)
- The source code for the demo is on Bitbucket at [https://bitbucket.org/aerobatic/d3s3/src](https://bitbucket.org/aerobatic/d3s3/src)

## Add data file to AWS S3
Upload the [Geographical Targets](https://goo.gl/qVgiYp) file to your AWS S3 bucket. If you're copying files a lot, you may consider using a tool like [Transmit](https://panic.com/transmit/).

## Prepare your site for data processing
At a minimum, you'll create an **index.html** like the following:

~~~html
<!doctype html>
<html>
<head>
    <script script src="//d3js.org/d3.v3.min.js" charset="utf-8"></script>
</head>
<body>
  <h1>My D3.js Demo</h1>
  <div id="d3div" class="d3">
    <script src='js/analysis.js'></script>
  </div>
</body>
</html>
~~~

## Create package.json
If you don't already have a **package.json** file, go ahead and create one. In it, we'll reference Aerobatic's [S3 proxy](/docs/s3-proxy), like so:

~~~json
{
  "_aerobatic": {
    "router": [
      {
        "path": "/s3-proxy",
        "module": "s3-proxy",
        "options": {
          "bucket": "{your bucket name}",
          "accessKeyId": "$S3_ACCESS_KEY_ID",
          "secretAccessKey": "$S3_SECRET_ACCESS_KEY",
          "overrideCacheControl": "max-age=2592000",
          "region":"us-west-2"
        }
      }
    ]
  }
}
~~~

## Enter environment variables

You'll notice in our **package.json** above that we're referencing a couple of environment variables i.e. `S3_ACCESS_KEY_ID` and `S3_SECRET_ACCESS_KEY`. We'll enter those in our Bitbucket repo:

  <img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/s3proxy/env-var.png" alt="Screenshot of creating environment variables in Aerobatic">

## Read in data
Create **js/analysis.js** and in it, you'll read in your data file that is stored on S3.

~~~javascript
d3.csv("/s3-proxy/data/adWordsLocations.csv", function(d) {
  return {
    criteria_id : +d["Criteria ID"],
    name : d.Name,
    canonical_name : d["Canonical Name"],
    country : d["Country Code"],
    parent_id : +d["Parent ID"],
    status : d.Status,
    target_type : d["Target Type"]
  };
}, function(data) {
  console.log(data[0]);
~~~

## Group and sort data
In this demo, we'll create a barchart that reads in the data, groups geographical targets by country, and then sorts the list of countries in descending order. So now, your **analysis.js** file will look more like the following:

~~~javascript
d3.csv("/s3-proxy/data/adWordsLocations.csv", function(d) {
  return {
    criteria_id : +d["Criteria ID"],
    name : d.Name,
    canonical_name : d["Canonical Name"],
    country : d["Country Code"],
    parent_id : +d["Parent ID"],
    status : d.Status,
    target_type : d["Target Type"]
  };
},function(data) {
  var countryCount = d3.nest()
    .key(function(d) { return d.country; })
    .rollup(function(v) { return v.length; })
    .entries(data)
    .sort(function(a, b){ return d3.descending(a.values, b.values); });
~~~

Btw, an excellent reference for manipulating data with JavaScript is [Learn JS Data](http://learnjsdata.com/) from the Bocoup Data Visualization team.

## Create d3.js barchart
The final thing we need to do in our **analysis.js** file is to add the code we need to plot the data in the barchart. Now, our **analysis.js** will look as follows:

~~~javascript
var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 5000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var svg = d3.select("#d3div").append("svg")
    .attr("width", '100%')
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("/s3-proxy/data/adWordsLocations.csv", function(d) {
  return {
    criteria_id : +d["Criteria ID"],
    name : d.Name,
    canonical_name : d["Canonical Name"],
    country : d["Country Code"],
    parent_id : +d["Parent ID"],
    status : d.Status,
    target_type : d["Target Type"]
  };
},function(data) {
  var countryCount = d3.nest()
    .key(function(d) { return d.country; })
    .rollup(function(v) { return v.length; })
    .entries(data)
    .sort(function(a, b){ return d3.descending(a.values, b.values); });

  x.domain(countryCount.map(function(d) { return d.key; }));
  y.domain([0, d3.max(countryCount, function(d) { return d.values; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Locations");

  svg.selectAll(".bar")
    .data(countryCount)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.key); })
    .attr("width", x.rangeBand())
    .attr("y", function(d) { return y(d.values); })
    .attr("height", function(d) { return height - y(d.values); });
});
~~~

## Putting it together

Your final visualization should look something like below:

<div id="d3div" class="d3">
  <script src='/js/analysis.js'></script>
</div>

And again:

- The demo site can be found at [https://d3s3.aerobaticapp.com/](https://d3s3.aerobaticapp.com/)
- The source code for the demo is on Bitbucket at [https://bitbucket.org/aerobatic/d3s3/src](https://bitbucket.org/aerobatic/d3s3/src)
