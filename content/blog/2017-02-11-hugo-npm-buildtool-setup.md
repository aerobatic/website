---
title: NPM scripts for building and deploying Hugo sites
description: Our marketing site, www.aerobatic.com, is built with Hugo. Learn about how we use npm scripts to manage our build and deploy process.
slug: hugo-npm-buildtool-setup
comments: true
date: 2017-02-12
tags: hugo, npm, build
---

<img src="/img/hugo-plus-npm.png" style="max-width: 500px; width:100%; margin-left: 1em; max-height: 15em; float:right">

As part of our recent relaunch, we migrated our marketing site (this one) to the [Hugo](https://gohugo.io) static site generator. After getting a hang of the basics, such as the directory structure and the Go template syntax, we're super pleased with the results &mdash; particularly the unparalleled build speed.

If you're new to Hugo, one of the things you learn pretty quickly is that unlike Jekyll, and some other popular static site generators, there's no plugin system to extend beyond the core task of combining Markdown and templates to output a set of static `.html` files. For example, there's no equivalent to [jekyll-assets](https://github.com/jekyll/jekyll-assets) to compile Sass, concat JavaScripts, etc. Fortunately the npm ecosystem already has great tools for performing these tasks, it just means your build system needs to take a "best of breed" approach that combines the awesome HTML generation powers of Hugo with other tools to do the rest. While you could wire everything together with a tool like gulp, this happens to be a great use case for [plain ole' npm scripts as the build tool](https://www.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/).

Before diving in further, here's our full `package.json`:

~~~json
{
  "name": "aerobatic-com-hugo",
  "version": "1.0.0",
  "private": true,
  "description": "Aerobatic marketing site at www.aerobatic.com",
  "scripts": {
    "clean": "rm -f static/*.js static/*.css",
    "babel:build": "babel assets/js --out-file static/site.js --source-maps",
    "babel:watch": "babel assets/js --watch --out-file static/site.js --source-maps",
    "sass:watch": "onchange 'assets/scss/**/*.scss' -- npm run sass:build",
    "sass:build": "node-sass --include-path node_modules/bootstrap-sass/assets/stylesheets assets/scss/main.scss static/site.css",
    "build:assets": "npm run clean && npm run sass:build && npm run babel:build",
    "build": "npm run build:assets && hugo",
    "build:aerobatic": "npm run build:assets && hugo --baseURL https://!!baseurl!!",
    "start": "npm run clean && npm run sass:build && npm run babel:build && parallelshell 'npm run sass:watch' 'npm run babel:watch' 'hugo serve'"
  },
  "devDependencies": {
    "babel-cli": "^6.18.0",
    "babel-preset-babili": "0.0.9",
    "node-sass": "^4.1.1",
    "onchange": "^3.2.1",
    "parallelshell": "^2.0.0"
  }
}
~~~

### Supporting npm modules

* [babel-cli](https://www.npmjs.com/package/babel-cli) - build our JavaScript into a single minified bundle. In our case we're not authoring ES6, but we certainly could with babel. The babel-cli has a built in watcher for detecting changes. The minification requires the [babel-preset-babili](https://github.com/babel/babili).
* [parallelshell](https://www.npmjs.com/package/parallelshell) - run multiple shell commands in parallel. Used to watch for changes to different file types and trigger the corresponding build tool.
* [node-sass](https://www.npmjs.com/package/node-sass) - compiles Sass `.scss` files to plain `.css`.
* [onchange](https://www.npmjs.com/package/onchange) - generic watcher used to detect changes to `*.scss` files and run the `sass:build` script.

## Local development

We're using the common npm convention of the "start" script for kicking off the local development server. Just a simple `npm start` and the Hugo site is up and running at `http://localhost:1313`. Let's dissect what's going on in the start script:

~~~sh
npm run clean && npm run sass:build && npm run babel:build && parallelshell 'npm run sass:watch' 'npm run babel:watch' 'hugo serve'
~~~

The `clean` script deletes any existing .js and .css files from the static directory. Hugo automatically watches and serves anything in the `/static` directory, but we can have other processes write files there. The `sass:build` and `babel:build` scripts are run first to re-generate the `.css` and `.js` files. Then we use  [parallelshell](https://www.npmjs.com/package/parallelshell) to run all of the following in parallel:

* `sass:watch` - npm script that regenerates `/static/*.css` files whenever there is a change matching the glob pattern `assets/**/*.scss`.
* `babel:watch` - npm script that regenerates the master `/static/site.js` JavaScript (which is minified and includes a companion source-map).
* `hugo serve` - Does an initial build of the site (including the files written to the `/static` directory by the initial `sass:build` and `babel:build` scripts), and watches for any changes. Hugo makes extensive use of caching so only the necessary `.html` files are re-built.

The key here, in case it's not obvious, is we are chaining watchers together. A manual change to a `/assets/*.scss` file will trigger `sass:build` which writes to the `/static` directory which in turn triggers the Hugo watcher to re-load it into its serving process. From Hugo's perspective, it's just as if we modified the `/static/main.css` file directly.

### Live Reload

A really slick feature of Hugo is [built-in LiveReload](https://gohugo.io/extras/livereload/) that automatically refreshes your browser whenever changes are made. And because of the aforementioned chained watching behavior, we get LiveReload for assets being watched by other processes like `node-sass` and `babel` as well. So long as our asset processors write to a directory being watched by Hugo; like `/static`. Because Hugo is so darn fast, you hardly even notice the reload. Save a file in your editor and voilà, by the time you shift your gaze to your browser, your latest changes are likely already there. In fact this is probably the smoothest development setup I've experienced &mdash; it's really a pleasure to work with.

## Deployment

We do continuous deployment of our site from [Bitbucket Pipelines](https://confluence.atlassian.com/bitbucket/bitbucket-pipelines-792496469.html). The `bitbucket-pipelines.yml` build manifest is pretty self explanatory:

~~~yaml
image: aerobatic/hugo
pipelines:
  branches:
    master:
      - step:
          script:
            - npm install
            - NODE_ENV=production npm run build:aerobatic
            - aero deploy -d public
---
~~~

The `build:aerobatic` npm script builds the css and js assets, then runs `hugo` to generate the final site to the `/public` directory. We then deploy the contents of the `/public` directory to Aerobatic. Pipelines is Docker based and we've published an optimized image, [aerobatic/hugo](https://hub.docker.com/r/aerobatic/hugo/), to Dockerhub that has the latest version of Hugo and the [aerobatic-cli](/docs/cli/) already installed. [This blog post](optimized-docker-images-continuous-deployment/) has more details.

This same setup could be replicated with most any CI/CD service. If Hugo is not already installed on the build image, then you can install it pretty easily from scratch.

### .gitignore

One last note on `.gitignore`. Aside from the expected lines such as `node_modules` and `public`, we also ignore `.js` and `.css` files in the `/static` directory. That's because these files are generated by the build process. We're not ignoring the entire `/static` directory however, because there are other assets that aren't pre-processed like images that are committed to git.

~~~text
node_modules
public
static/*.css
static/*.js
static/*.js.map
~~~

## Conclusion

Eliminating friction from the local development workflow makes a huge difference in productivity and enjoyment level. While this setup took a little bit of time to dial in, it's proven to be smooth and efficient for our team. Hopefully it's helpful in setting up your own Hugo + NPM build system. And if you are looking for a home on the internet for your statically generated website, we hope you'll consider hosting with Aerobatic.

Happy coding!
