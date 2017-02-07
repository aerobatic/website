---
title: Configuration
name: configuration
---

# Configuration

All your website configuration (with the exception of custom domain) is contained in the `aerobatic.yml` file at the root of your project folder. The only required property is the `id` which is the unique Aerobatic identifier of your website. The `aerobatic.yml` file is created for you upon running the [`aero create`](/docs/cli#create) CLI command.

{{< highlight yaml >}}
id: 42d648ac-e516-46a5-a831-62973841267c{{< /highlight >}}

There are two additional sections that can be added to the yml file: `deploy` and `plugins`. The `deploy` block allows specifying config settings that affect how the `aero deploy` command works.

{{< highlight yaml >}}
deploy:
  ignore: [*.scss]  # Don't deploy .scss files
  directory: _site  # Specifies the directory to deploy{{< /highlight >}}

## Plugins

Plugins allow you to augment the core static hosting with additional capabilities such as authentication, custom errors, redirects, and more. The plugin appears as an entry in the `plugins` array in `aerobatic.yml`.

The sequence of plugins in the array is important. The incoming http request passes through each plugin in the order of appearance. The plugin has the opportunity to act on the request, either by sending a response (in which case the remaining plugins are never executed), or allowing the request to flow through to the next plugin.  The [http-proxy](/docs/plugins/http-proxy) is an example of a plugin that handles the request directly, so any plugins appearing after it will not get executed (provided the `path` is a match). The [http-headers](/docs/plugins/http-headers) plugin, on the other hand, adds some headers to the response, then passes execution along to the next plugin.

{{% alert warning %}}
**TIP** This req / res pipeline pattern will be familiar to developers that have worked with [Rack](http://rack.github.io/) or [Express](http://expressjs.com/en/guide/using-middleware.html) middleware. Aerobatic itself is built atop Express. While it's somewhat helpful to understand the concept of middleware flow, no experience with Node.js or Ruby is required to deploy websites on Aerobatic.
{{% /alert %}}

#### Declaring plugins

Here is the basic form for declaring a plugin:

{{< highlight yaml >}}
plugins:
  - name: plugin-name    # required - the name of the plugin
    path:                # optional - only invoke if the URL path matches
    stages: []           # optional - only invoke if current deploy stage appears in list
    options:             # depends on the specific plugin
      option1: true
      option2: 5{{< /highlight >}}

Here's a basic `plugins` definition that declares a couple of our most popular plugins: [custom-errors](/docs/plugins/custom-errors/) and [password-protect](/docs/plugins/password-protect/).

{{< highlight yaml >}}
plugins:
  - name: custom-errors
    options:
      404: errors/404.html

  - name: basic-auth
    path: /protected
    options:
      username: $BASIC_AUTH_USERNAME
      password: $BASIC_AUTH_PASSWORD

  - name: webpage{{< /highlight >}}

Notice that the `basic-auth` declaration includes a `path` property whereas the others do not. This indicates that the plugin should only be invoked if the incoming URL is under the `/protected` directory (including nested directories). The other plugins are invoked for all requests assuming the request makes it that far. The `username` and `password` values are being specified as environment variables - more on that below.

#### Stage specific plugins

Plugins can include an optional `stages` property which specifies when the plugin should be activated. Valid values are `production` and the names of any [deploy stage](/docs/overview#deploy-stages) such as `staging`, `test`, etc.

A common use case is wanting to lock down only staging instances with the `basic-auth` plugin. In the example below visitors to `https://staging.custdomain.net` will be prompted for credentials, but not `https://custdomain.net`.

{{< highlight yaml >}}
- name: basic-auth
  stages: [staging]
  options:
    username: $BASIC_AUTH_USERNAME
    password: $BASIC_AUTH_PASSWORD{{< /highlight >}}

### Environment variables

Environment variables can be used to store sensitive configuration settings that you don't want to hard-code into the `aerobatic.yml` file (which you should commit to source-control along with the rest of your project). The basic-auth password is a prime example.

There are two ways to manage environment variables: with the `aero env` CLI command and in the control panel web app.

**Set an environment variable**
~~~sh
[$] aero env --name BASIC_AUTH_PASSWORD --value password123NO
~~~

Environment variables can even have different values for different stages. For example maybe you want production and test stages to have different passwords.

**Set stage specific values**
~~~sh
[$] aero env --name BASIC_AUTH_PASSWORD --value password123NO --stage production
[$] aero env --name BASIC_AUTH_PASSWORD --value password456NO --stage test
~~~

{{% alert warning %}}
These environment variables are used at runtime by your website plugins. There is also an `AEROBATIC_API_KEY` environment variable which is to be [configured with your CI service](/docs/continuous-deployment#aerobatic-apikey) rather than the `aero env` command.
{{% /alert %}}
