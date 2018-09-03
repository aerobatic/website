---
title: Hosting Swagger API Documentation
slug: hosting-swagger-api-documentation
comments: true
date: 2018-08-28
description: How to create a static site for your Swagger API documentation and host it on Aerobatic
---

[Swagger](http://swagger.io/) is a specification format for documenting the interface for RESTful APIs. Essentially, you author a YAML file that describes the operations and their inputs and outputs. There is an ecosystem of tools that can auto-generate documentation or SDKs. For documentation generation there is a project called [swagger-ui](https://swagger.io/tools/swagger-ui/) that will generate attractive interactive HTML/JavaScript documentation from a Swagger API specification.

The latest version of swagger-ui is packaged as an [npm module](https://www.npmjs.com/package/swagger-ui) that can be imported into a JavaScript application. To make it easy to get started, we've provided a starter app you can download and tweak. It's ready made to be deployed to Aerobatic. You can see the live demo at: [https://swagger-ui-demo.aerobaticapp.com/](https://swagger-ui-demo.aerobaticapp.com/). The [create-react-app](https://github.com/facebook/create-react-app) to bootstrap a small React app that acts as a simple host container.

### Getting started steps

1. [Download the demo](https://github.com/aerobatic/swagger-ui-demo/archive/master.zip) and unzip
2. From the root of the repo run `npm install && npm run build`
3. Create a new Aerobatic application with `aero create -n your-website-name`
4. Deploy the built site to Aerobatic with `aero deploy`

### Swagger definition

The demo uses the [Pet Store sample](http://petstore.swagger.io/v2/swagger.json) API json definition file. To substitute your own API's swagger definition, you have two options:

- Point to the swagger JSON definition via a remote URL

  ```js
  import petStoreSwagger from "./petstore-swagger.json";

  SwaggerUI({
    dom_id: "#ui",
    spec: petStoreSwagger
  });
  ```

- Place the swagger JSON file within this project and import it directly

  ```js
  SwaggerUI({
    dom_id: "#ui",
    url: "http://petstore.swagger.io/v2/swagger.json"
  });
  ```

### Authentication for your API docs

If your API is private, you might want to put authentication if front of your Swagger docs. This is easy to do with Aerobatic using either the [password-protect](/docs/plugins/password-protect) or [auth0](/docs/plugins/auth0) plugins.
