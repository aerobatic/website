---
title: Configuration
name: configuration
---

# Configuration

All your website configuration (with the exception of custom domain) is contained in the `aerobatic.yml` file at the root of your project folder. The only required property is the `id` which is the unique Aerobatic identifier of your website. The `aerobatic.yml` file is created for you upon running the [`aero create`](/docs/cli#create) CLI command.

{{< highlight yaml >}}
id: 42d648ac-e516-46a5-a831-62973841267c{{< /highlight >}}

There are two additional sections that can be added to the yml file: `deploy` and `plugins`. The `deploy` block allows specifying config settings that affect how the `aero deploy` command works.

```yaml
deploy:
  ignore: [*.scss]  # Don't deploy .scss files
  directory: _site  # Specifies the directory to deploy
```

## Plugins

Plugins allow you to augment the core static hosting with additional capabilities such as authentication, custom errors, redirects, and more. A growing list of the available plugins can be found in the [plugins gallery](/docs/plugins/).

Each plugin is declared in the `plugins` array of `aerobatic.yml`. The sequence of the array is important as that is the same order the incoming HTTP request passes through. Each plugin has the opportunity to act on the request, either by sending a response (in which case the remaining plugins are never executed), or allowing the request to flow through to the next one.

The [http-proxy](/docs/plugins/http-proxy) is an example of a plugin that handles the request directly, so any plugins appearing after it will not get executed (provided the `path` is a match). The [http-headers](/docs/plugins/http-headers) plugin, on the other hand, adds some headers to the response, then passes execution along to the next one in the pipeline.

{{% alert tip %}}
This req / res pipeline pattern will be familiar to developers that have worked with [Rack](http://rack.github.io/) or [Express](http://expressjs.com/en/guide/using-middleware.html) middleware. Aerobatic itself is built atop Express. While it's somewhat helpful to understand the concept of middleware flow, no experience with Node.js or Ruby is required to deploy websites on Aerobatic.
{{% /alert %}}

#### Declaring plugins

Here is the basic form for declaring a plugin:

```yaml
plugins:
  - name: plugin-name # required - the name of the plugin
    path: # optional - only invoke if the URL path matches
    stages: [] # optional - only invoke if current deploy stage appears in list
    options: # depends on the specific plugin
      option1: true
      option2: 5
```

Here's a basic `plugins` definition that declares a couple of our most popular plugins: [custom-errors](/docs/plugins/custom-errors/) and [password-protect](/docs/plugins/password-protect/).

```yaml
plugins:
  - name: custom-errors
    options:
      errors:
      404: errors/404.html

  - name: password-protect
    path: /protected
    options:
      username: $USERNAME
      password: $PASSWORD

  - name: webpage
```

Notice that the `password-protect` declaration includes a `path` property whereas the others do not. This indicates that the plugin should only be invoked if the incoming URL is under the `/protected` directory (including nested directories). The other plugins are invoked for all requests assuming the request makes it that far. The `username` and `password` values are being specified as environment variables - more on that below.

**Array of paths**

You can also set `path` to an array if you want to mount the plugin at more than one path. In the following example (taken from our [Gatsby instructions](/docs/static-site-generators/#gatsby)), the [http-headers](/docs/plugins/http-headers/) plugin is configured to override the `Cache-Control` header for any request with a `.js` or `.js.map` extension.

```yaml
plugins:
  - name: http-headers
    path: ['/*.js', '/*.js.map']
    options:
      'Cache-Control': 'public, max-age=31536000'
```

#### Stage specific plugins

Plugins can include an optional `stages` property which specifies when the plugin should be activated. Valid values are `production` and the names of any [deploy stage](/docs/overview#deploy-stages) such as `staging`, `test`, etc.

A common use case is wanting to lock down only staging instances with the `basic-auth` plugin. In the example below visitors to `https://staging.custdomain.net` will be prompted for credentials, but not `https://custdomain.net`.

```yaml
plugins:
  - name: basic-auth
    stages: [staging]
    options:
      username: $BASIC_AUTH_USERNAME
      password: $BASIC_AUTH_PASSWORD
```

### Environment variables

Environment variables can be used to store sensitive configuration settings that you don't want to hard-code into the `aerobatic.yml` file (which you should commit to source-control along with the rest of your project). The basic-auth password is a prime example.

There are two ways to manage environment variables: with the `aero env` CLI command and in the control panel web app.

**Set an environment variable**

{{<cli "aero env --name BASIC_AUTH_PASSWORD --value password123NO" >}}

Environment variables can even have different values for different stages. For example maybe you want production and test stages to have different passwords.

**Set stage specific values**

{{<cli "aero env --name BASIC_AUTH_PASSWORD --value password123NO --stage production" >}}
{{<cli "aero env --name BASIC_AUTH_PASSWORD --value password456NO --stage test" >}}

{{% alert tip %}}
These environment variables are used at runtime by your website plugins. There is also an `AEROBATIC_API_KEY` environment variable which is to be [configured with your CI service](/docs/deployment#aerobatic-apikey) rather than the `aero env` command.
{{% /alert %}}

## Site scanner

The site scanner crawls and examines the content of your website after each deployment. Currently the only function of the scanner is to build the search index for the [keyword-search](/docs/plugins/keyword-search) plugin, but it has been designed to offer additional site services for catching broken links and performing SEO audits. See the [site-scanner configuration](/docs/configuration/#site-scanner) for further details. Sites must opt-in to be scanned by declaring a `scanner` section in the `aerobatic.yml`.

Currently the only supported property is `keywordSearch` which is used to configure how the search index is built. See the [keyword-search](/docs/plugins/keyword-search/#configuration) docs for full details.

```yaml
scanner:
  keywordSearch: {}
```
