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

{{% alert warning %}}
**TIP** This req / res pipeline pattern will be familiar to developers that have worked with [Rack](http://rack.github.io/) or [Express](http://expressjs.com/en/guide/using-middleware.html) middleware. Aerobatic itself is built atop Express. While it's somewhat helpful to understand the concept of middleware flow, no experience with Node.js or Ruby is required to deploy websites on Aerobatic.
{{% /alert %}}

#### Declaring plugins

Here is the basic form for declaring a plugin:

{{< highlight yaml >}}
plugins:

* name: plugin-name # required - the name of the plugin
  path: # optional - only invoke if the URL path matches
  stages: [] # optional - only invoke if current deploy stage appears in list
  options: # depends on the specific plugin
  option1: true
  option2: 5{{< /highlight >}}

Here's a basic `plugins` definition that declares a couple of our most popular plugins: [custom-errors](/docs/plugins/custom-errors/) and [password-protect](/docs/plugins/password-protect/).

{{< highlight yaml >}}
plugins:

* name: custom-errors
  options:
  errors:
  404: errors/404.html

* name: basic-auth
  path: /protected
  options:
  username: $BASIC_AUTH_USERNAME
  password: $BASIC_AUTH_PASSWORD

* name: webpage{{< /highlight >}}

Notice that the `basic-auth` declaration includes a `path` property whereas the others do not. This indicates that the plugin should only be invoked if the incoming URL is under the `/protected` directory (including nested directories). The other plugins are invoked for all requests assuming the request makes it that far. The `username` and `password` values are being specified as environment variables - more on that below.

#### Stage specific plugins

Plugins can include an optional `stages` property which specifies when the plugin should be activated. Valid values are `production` and the names of any [deploy stage](/docs/overview#deploy-stages) such as `staging`, `test`, etc.

A common use case is wanting to lock down only staging instances with the `basic-auth` plugin. In the example below visitors to `https://staging.custdomain.net` will be prompted for credentials, but not `https://custdomain.net`.

{{< highlight yaml >}}

* name: basic-auth
  stages: [staging]
  options:
  username: $BASIC_AUTH_USERNAME
  password: $BASIC_AUTH_PASSWORD{{< /highlight >}}

## Deploy Alerts

<img src="/img/deploy-alert-types.png" style="display:block; margin: 0 auto"/>

You can specify that an alert be sent whenever a deployment completes. The two currently supported alert types are email and Slack. To send an alert for all deployments (regardless of stage), declare YAML like so in your `aerobatic.yml`:

```yaml
deploy:
  alerts:
    default:
      # You can specify one or both of these keys
      email:
        to: [userA@company.com, userB@company.com]
      slack:
        username: 'Website Update'  # Optional, defaults to "Aerobatic Deploys"
        webhookUrl: https://hooks.slack.com/services/xxx/xxx/xxxx
```

To get the `webhookUrl`, just add the [Incoming Webhook App](https://slack.com/apps/A0F7XDUAZ-incoming-webhooks) to your Slack instance. You simply specify which channel you want the alerts to be posted to (i.e. something like "#deployments") and you'll be provided the URL to paste into your `aerobatic.yml` file. You can also choose an icon or emoji that appears next to each alert.

If you don't want to store the `webhookUrl` in clear text, you can also configure it as an [environment variable](/docs/configuration/#environment-variables):

```yaml
slack:
  webhookUrl: $SLACK_DEPLOY_ALERT_URL
```

Deploy these changes and you'll start getting alerts with each new deployment. The alert includes the name of the website, the version name, an optional message, and a hyperlink that launches the site.

![Slack Alert](/img/slack-deploy-alert.png)

The deploy message is a handy way to provide a short description of the what was changed. The message is provided to the `aero deploy` command like so:

{{<cli "aero deploy --message 'Added new link to the global footer'" >}}

### Stage specific alerts

There is also the flexibility to define different alerts based on the deploy stage. For example, if you are an agency, you might want to post alerts for all deployments to your team's internal Slack channel, but additionally send an email alert to the client for production deployments:

```yaml
deploy:
  alerts:
    default:
      slack:
        webhookUrl: https://hooks.slack.com/services/xxx/xxx/xxxx
    production:
      email:
        to: [sally@client.co]  # Alert the client for production deployments
```

You can also omit the `default` section altogether and configure alerts on a stage by stage basis - whatever best fits your workflow.

### Environment variables

Environment variables can be used to store sensitive configuration settings that you don't want to hard-code into the `aerobatic.yml` file (which you should commit to source-control along with the rest of your project). The basic-auth password is a prime example.

There are two ways to manage environment variables: with the `aero env` CLI command and in the control panel web app.

**Set an environment variable**

{{<cli "aero env --name BASIC_AUTH_PASSWORD --value password123NO" >}}

Environment variables can even have different values for different stages. For example maybe you want production and test stages to have different passwords.

**Set stage specific values**

{{<cli "aero env --name BASIC_AUTH_PASSWORD --value password123NO --stage production" >}}
{{<cli "aero env --name BASIC_AUTH_PASSWORD --value password456NO --stage test" >}}

{{% alert warning %}}
These environment variables are used at runtime by your website plugins. There is also an `AEROBATIC_API_KEY` environment variable which is to be [configured with your CI service](/docs/continuous-deployment#aerobatic-apikey) rather than the `aero env` command.
{{% /alert %}}

## Site scanner

The site scanner crawls and examines the content of your website after each deployment. Currently the only function of the scanner is to build the search index for the [keyword-search](/docs/plugins/keyword-search) plugin, but it has been designed to offer additional site services for catching broken links and performing SEO audits. See the [site-scanner configuration](/docs/configuration/#site-scanner) for further details. Sites must opt-in to be scanned by declaring a `scanner` section in the `aerobatic.yml`.

Currently the only supported property is `keywordSearch` which is used to configure how the search index is built. See the [keyword-search](/docs/plugins/keyword-search/#configuration) docs for full details.

```yaml
scanner:
  keywordSearch: {}
```
