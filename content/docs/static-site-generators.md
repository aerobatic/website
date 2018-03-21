---
title: Static site generators
name: static-site-generators
---

# Static site generators

Aerobatic is a perfect hosting complement to static site generators such as [Jekyll](https://jekyllrb.com/), [Hugo](https://gohugo.io), [Hexo](https://hexo.io/), [Gatsby](https://www.gatsbyjs.org/) and others. Simply configure `aerobatic-cli` to deploy the directory where the generator emits the built site (`_site`, `public`, `dist`, etc.). Aerobatic works with **any** tool that generates static HTML, but we provide some specific guidance for the following popular generators:

{{% col-3 1 %}}[![jekyll](/img/frameworks/jekyll.png)](#jekyll){{% /col-3 %}}
{{% col-3 2 %}}[![hugo](/img/frameworks/hugo.png)](#hugo){{% /col-3 %}}
{{% col-3 3 %}}[![react](/img/frameworks/react.png)](#react){{% /col-3 %}}

{{% col-3 1 %}}[![hexo](/img/frameworks/hexo.png)](#hexo){{% /col-3 %}}
{{% col-3 2 %}}[![yeoman](/img/frameworks/gatsby.png)](#gatsby){{% /col-3 %}}
{{% col-3 3 %}}[![plain-html](/img/frameworks/html.png)](#html){{% /col-3 %}}

{{% col-3 1 %}}[![yeoman](/img/frameworks/yeoman.png)](#yeoman){{% /col-3 %}}
{{% col-3 2 %}}{{% /col-3 %}}
{{% col-3 3 %}}{{% /col-3 %}}

### Specifying deploy directory

There are two ways to configure the deploy directory:

* Add a `deploy` section to your `aerobatic.yml` with a `directory` prop:

  ```yaml
  deploy:
    directory: _site
  ```

  With this approach you just run `aero deploy` to deploy your site.

  **Or**, pass a command line option:

  {{<cli "aero deploy --directory \_site" "You can also use shorthand -d">}}

Full docs on the [deploy command](/docs/cli/#deploy)

### Configuring the site url {#configuring-site-url}

In general we suggest using relative URLs in your template files since the browser will automatically resolve them to the current host and protocol. For example:

```html
<!-- Prefer this: -->
<a href="/about/contact">Contact Us</a>
<!-- Over this: -->
<a href="https://yoursite.com/about/contact">Contact Us</a>
```

That way the same markup will function identically no matter where what the base host is, i.e. `http://localhost:4000`, `https://yoursite.com`, or `https://test.yoursite.com`.

However, most static site generators have a `url` or `baseURL` config setting that is used to build an absolute URL. You could hardcode this value to your production URL, but then it won't automatically adjust when you push the version from one stage to another, i.e. `www--test.domain.com` to `www.domain.com`. If you are going to be taking advantage of [deploy stages](/docs/deployment/#deploy-stages), we recommend that you specify the reserved value <span class="code">https://!!baseurl!!</span> which Aerobatic substitutes at render time with the actual requested site url. We offer ways to configure this for specific generators below.

### Generator configurations

Here some configuration tips for some of the popular static site generators. Even if your generator isn't listed, it's likely that it offers very similar functionality. These tips are relevant both when deploying to Aerobatic locally or from a [continuous integration build](/docs/deployment/#continuous-deployment).

### Jekyll

<div class="generator-section"><img alt="Jekyll" src="/img/frameworks/jekyll.png"></div>

Here's how to generate a new Jekyll site from scratch and deploy it to Aerobatic:

{{<cli "jekyll new my-jekyll-site">}}
{{<cli "cd my-jekyll-site">}}
{{<cli "aero create" "create the Aerobatic site">}}
{{<cli "echo 'url: https://!!baseurl!!' > \_aerobatic.config.yml" "override site.url for Aerobatic">}}
{{<cli "jekyll build --config \_config.yml,\_aerobatic.config.yml" "generate the output">}}
{{<cli "aero deploy --directory \_site" "deploy output to Aerobatic">}}

Rather than passing the `--directory` option every time, you can alternatively specify it in the aerobatic.yml file.

```yaml
deploy:
directory: \_site
```

Putting this all together for a CI build, your script might look like the following:

```bash
bundle install # Re-run on every build in a CI enviroment
jekyll build --config _config.yml,_config.aerobatic.yml
aero deploy --directory _site
```

**Additional reading**

* [Continuous deployment of Jekyll with GitHub and TravisCI](/blog/jekyll-travis-github-aerobatic/)
* [Continuous deployment of Jekyll site with Bitbucket Pipelines](/blog/jekyll-bitbucket-pipelines/)
* [How to password protect a Jekyll site](/blog/password-protect-a-jekyll-site/)

## Hugo

<div class="generator-section"><img alt="Hugo" src="/img/frameworks/hugo.png"></div>

Here's how you to create a new [Hugo](https://gohugo.io/) site from scratch and deploy to Aerobatic:

{{<cli "hugo new site my-new-hugo-site">}}
{{<cli "cd my-new-hugo-site">}}
{{<cli "mkdir -p themes">}}
{{<cli "(cd themes; git clone https://github.com/eliasson/liquorice)" "clone a theme">}}
{{<cli "aero create" "create the Aerobatic site">}}
{{<cli "hugo --baseURL https://!!baseurl!! --theme liquorice" "build the site overriding baseURL">}}
{{<cli "aero deploy -d public" "deploy output to Aerobatic">}}

The [spf13/hugoThemes](https://github.com/spf13/hugoThemes) repo has an extensive collection of git sub-modules. Click on anyone of them to get the URL of an individual theme.

In the rendered page response, the <span class="code">https://!!baseurl!!</span> will be replaced with the actual site url.

**Installing Hugo on a build server image**

If you need to install hugo in a CI script, here's the commands for doing so (assuming an Ubuntu based build image). You can obviously specify whatever version of hugo you like.

```sh
apt-get update -y && apt-get install wget
wget https://github.com/spf13/hugo/releases/download/v0.18/hugo_0.18-64bit.deb
dpkg -i hugo*.deb
```

If you're CI service supports custom Docker images, we've provided the [aerobatic/hugo](https://hub.docker.com/r/aerobatic/hugo/) image which has hugo, [aerobatic-cli](/docs/cli/), and other supporting software all set to go. See this [blog post](/blog/hugo-bitbucket-pipelines/) to learn how to build and deploy your Hugo sites with Bitbucket Pipelines. This additional [blog post](/blog/hugo-github-circleci/) shows how to build and deploy your Hugo site with GitHub and CircleCI.

## Hexo

<div class="generator-section"><img alt="Hexo" src="/img/frameworks/hexo.png"></div>

Here's how to create a new [Hexo](https://hexo.io) site and deploy it to Aerobatic:

{{<cli "hexo init new-hexo-site">}}
{{<cli "cd new-hexo-site">}}
{{<cli "npm install">}}
{{<cli "aero create" "create the Aerobatic site">}}
{{<cli "echo 'url: https://!!baseurl!!' > \_aerobatic.config.yml" "override site.url for Aerobatic">}}
{{<cli "hexo generate --config \_config.yml,\_aerobatic.config.yml" "generate the output">}}
{{<cli "aero deploy -d public" "deploy output to Aerobatic">}}

## Gatsby

<div class="generator-section"><img alt="react" src="/img/frameworks/gatsby.png"></div>

Here's how to generate a new [Gatsby](https://www.gatsbyjs.org/) site from scratch and deploy it to Aerobatic:

{{<cli "gatsby new gatsby-project">}}
{{<cli "cd gatsby-project">}}
{{<cli "aero create --name my-gatsby-project" "create the Aerobatic site">}}
{{<cli "gatsby build" "build the gatsby site">}}
{{<cli "aero deploy --directory public" "deploy build output to Aerobatic">}}

<!-- There are also a couple of recommended config settings to make in the `aerobatic.yml` to take full advantage of the way Gatsby optimizes the build output.

First we can disable the Aerobatic [asset fingerprinting](/docs/site-optimizer/#asset-fingerprinting) since Gatsby already takes care of that. Secondly, we can use the [http-headers](/docs/plugins/http-headers) plugin to set an aggressive `Cache-Control` header on all `.js` and `.js.map` requests. If contents of these files change, Gatsby will generate a differently named file, so there's no reason not to cache for a full year.

```yaml
deploy:
  # Note with below setting it is not neccessary to pass --directory to aero deploy command
  directory: public
  optimizer:
    fingerprintAssets: false

plugins:
  - name: http-headers
    path: ['/*.js', '/*.js.map']
    options:
      "Cache-Control": "public, max-age=31536000"
  - name: webpage
``` -->

## React

<div class="generator-section"><img alt="react" src="/img/frameworks/react.png"></div>

Here's how to create a new React app from scratch using the excellent [create-react-app](https://github.com/facebookincubator/create-react-app) tool and deploy it to Aerobatic:

{{<cli "create-react-app my-react-app">}}
{{<cli "cd my-react-app">}}
{{<cli "aero create" "create the Aerobatic site">}}
{{<cli "yarn build" "generate the production optimized build">}}
{{<cli "aero deploy --directory build" "deploy output to Aerobatic">}}

Hosting your static React front-end on Aerobatic paired with a serverless backend running on service like [AWS API Gateway](https://aws.amazon.com/api-gateway/) is a great decoupled front end / backend setup. In fact that's exactly how our [Dashboard](https://dashboard.aerobatic.com) works.

## Yeoman

<div class="generator-section"><img alt="yeoman" src="/img/frameworks/yeoman.png"></div>

Here's how to create a new [AngularJS](https://github.com/yeoman/generator-angular) app with [Yeoman](http://yeoman.io/) and deploy it to Aerobatic:

{{<cli "mkdir my-angular-app">}}
{{<cli "cd my-angular-app">}}
{{<cli "yo angular" "scaffold the angular app">}}
{{<cli "aero create" "create the Aerobatic site">}}
{{<cli "gulp build" "build the production output">}}
{{<cli "aero deploy --directory dist" "deploy output to Aerobatic">}}

Of course there are [many other Yeoman generators](http://yeoman.io/generators/) that emit a static site which can be used in the same basic manner.

## Plain Html {#html}

<div class="generator-section"><img alt="html" src="/img/frameworks/html.png"></div>

Ok, plain html isn't really a generator at all. No build step necessary, just run `aero deploy` right from the root of your project.

{{<cli "mkdir plain-html">}}
{{<cli "cd plain-html">}}
{{<cli "echo '<html>Hello Aerobatic!</html>' > index.html">}}
{{<cli "aero create">}}
{{<cli "aero deploy">}}
