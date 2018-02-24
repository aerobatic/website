---
title: Announcing the Auth0 plugin
description: The Aerobatic auth0 plugin provides a seamless integration with Auth0 for identity management
date: 2018-02-19
slug: announcing-auth0-plugin
---

<img src="https://www.aerobatic.com/media/logos/auth0-logo.png" style="float: right; width: 250px; margin-left: 20px;" />We are excited to announce availability of our [auth0 plugin](/docs/plugins/auth0/). It provides a full identity management solution for your static website hosted on Aerobatic. Now you can power membership based sites with your [Auth0](https://auth0.com) account and just a few lines of configuration.

The [plugin docs](/docs/plugins/auth0) has a detailed walkthrough for how to get started. We also have a [demo site](https://auth0-demo.aerobaticapp.com) with [source code](https://github.com/aerobatic/auth0-demo) that should be helpful.

The basic steps to get up and running are:

1. Create Auth0 account
2. Configure Auth0 client and connection
3. Set the allowed URLs on the Auth0 client
4. Declare the `auth0` plugin in your `aerobatic.yml` using your Auth0 tenant, client ID, and client secret
5. Deploy your website

```yaml
plugins:
  - name: auth0
    path: /members
    options:
      clientId: $AUTH0_CLIENT_ID
      clientSecret: $AUTH0_CLIENT_SECRET
      tenant: auth0-tenant-name
```

You can configure the plugin to require authentication for your entire website or a specific sub-directory. This allows you to have a publicly accessible homepage with a link to register or login. The [demo site](https://auth0-demo.aerobaticapp.com) takes this approach. When a user attempts to navigate to the protected part of the site, they will be redirected to the hosted Auth0 login screen.

<img src="//www.aerobatic.com/media/docs/auth0/hosted-login-page.png">

You can configure login using username/password or [3rd party identity providers](https://auth0.com/docs/identityproviders) (including Facebook, Google, Salesforce, Microsoft, and many more) or both. We also make the logged-in user context available to your own code so you can display their name and picture if you choose. The [demo site](https://auth0-demo.aerobaticapp.com) has an example of this.

Head on over to the [official plugin documentation](/docs/plugins/auth0/) for a full walkthrough on how to enable identity management for your Aerobatic static site.
