---
title: Hosting Swagger API Documentation with Bitbucket
subtitle:
slug: hosting-swagger-api-documentation-wth-bitbucket
comments: true
date: 2015-10-21
description: How to create a static site for your Swagger API documentation and host it on Bitbucket and Aerobatic
---

[Swagger](http://swagger.io/) is a specification format for documenting the interface for RESTful APIs. Essentially, you author a YAML file that describes the operations and their inputs and outputs. There is an ecosystem of tools that can auto-generate documentation or SDKs. For documentation generation there is a project called [swagger-ui](http://swagger.io/) that will generate attractive interactive HTML/JavaScript documentation from a Swagger API specification.

<a href="http://swagger-ui.aerobaticapp.com/"><img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/swagger/swagger-aerobatic.png" alt="Swagger Docs Live on Aerobatic" ></a>

All that's left is somewhere to host the generated documentation so you can share it out to would-be API consumers. Since the generated Swagger output is pure static HTML, [Aerobatic](/) is a perfect hosting solution host it on and here's how to set it up:


##### 1. Import the swagger-ui repo

Import the swagger-ui from Github to create a new Bitbucket repo using the following URL: `https://github.com/swagger-api/swagger-ui.git`. Clone the repo locally and run `npm install` from the root.

#### 2. Edit gulpfile
Open the `gulpfile.js` in an editor and add the following block to the end of the `_copy` function (line 123 at the time of writing):

~~~js
 gulp.src('./swagger.json')
  .pipe(gulp.dest('./dist'))
  .on('error', log);
~~~

#### 3. Set `swagger.json` location
Open the `src/main/html/index.html` file and change the string `http://petstore.swagger.io/v2/swagger.json` to just `swagger.json`. Afterwards it should look like the following (line 35 at the time of writing):

~~~js
if (url && url.length > 1) {
  url = decodeURIComponent(url[1]);
} else {
  url = '/swagger.json';
}
~~~

This will cause the UI to load the swagger spec from this repo.

#### 4. Author your API specification
Head over to the [online Swagger editor](http://editor.swagger.io) to start creating your API specification. It will provide a handy live side-by-side preview of the generated HTML output as you type in the editor pane. You can also use one of the pre-canned examples:

<img class="screenshot" src="//www.aerobatic.com/media/blog/swagger/swagger-instagram.png" alt="Swagger Editor Instagram Example" >

#### 5. Download JSON
When you're ready use the *File > Download JSON* menu option and save the file as `swagger.json` to the root of the repo you cloned in step 1.

#### 6. Run `gulp`
Run the `gulp` command to generate the assets in your `dist` folder.

#### 7. Deploy

Assuming you already have an Aerobatic account and have [installed the aerobatic-cli](https://www.aerobatic.com/docs/cli/):

~~~bash
aero create
aero deploy -d dist
~~~

#### 8. Congratulations, your Swagger API documentation is live!

* The demo app for this tutorial is [hosted on Aerobatic](http://swagger-ui.aerobaticapp.com/)
* The code repository for the demo app is on [Bitbucket](https://bitbucket.org/aerobatic/swagger-ui/src)

To make updates to your Swagger documentation, use the "Paste JSON" command of the online editor to import `swagger.json` file. Make your changes then download the JSON and replace the contents of your local file. Git push and your site will be updated automatically.

#### Basic Authentication
You may want to add HTTP Basic Authentication to your Swagger API documentation so that only those in your internal team have access. That's easy to do with the Aerobatic [basic-auth plugin](/docs/http-basic-authentication).
