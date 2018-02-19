---
title: Auth0 plugin
plugin: true
name: auth0
---

# Auth0 plugin

The `auth0` plugin provides robust authentication and user management for your static website hosted on Aerobatic via an integration with Auth0 &mdash; a leading provider of identify management services. Using this plugin, all your user's credentials live securely within Auth0. Login and sign-up takes place on your Auth0 [hosted login page](https://auth0.com/docs/hosted-pages/login). You can allow users to register with a username or password, or via any of the Auth0 supported social and enterprise [3rd party identify providers](https://auth0.com/docs/identityproviders) including Google, Facebook, GitHub, Salesforce, and [many more](https://auth0.com/docs/identityproviders).

See the plugin in action on our [demo site](https://auth0-demo.aerobaticapp.com) ([source code](https://github.com/aerobatic/auth0-demo)).

### Configuration

```yaml
plugins:
  - name: auth0
    path: /members
    options:
      clientId: $AUTH0_CLIENT_ID
      clientSecret: $AUTH0_CLIENT_SECRET
      tenant: aero-demo
```

### Options

{{% option "tenant" %}}
The name of your Auth0 tenant. This could be a dedicated tenant for your website, or a tenant that is shared amongst multiple websites. See the [Single Sign-On](#single-signon) section for more on this.
{{% /option %}}

{{% option "clientId" %}}
The Client ID for your Auth0 client.
{{% /option %}}

{{% option "clientSecret" %}}
The Client Secret for your Auth0 client.
{{% /option %}}

{{% option "cookieExpiresMinutes" %}}
How long a logged in session should last. If omitted, the cookie will be a session cookie and last until the browser is closed. If you'd like the user to be able to close their browser and access the protected portions of your site without re-authenticating, you can explicitly set this option.
{{% /option %}}

### Specifying what to protect

You can choose to require visitors to be authenticated to access the entire site, or just a specific sub-directory. For a membership website you may want your root `index.html` homepage to be unprotected in order to market your site to the public, then nest all the members-only content within a sub-directory like `/members`.

**Protect entire site**

```yaml
plugins:
  - name: auth0
    options:
```

**Protect sub-directory**

```yaml
plugins:
  - name: auth0
    path: /members
    options:
```

## Configure Auth0

##### Step 1: Create Tenant

If you haven't already, [register for Auth0](https://auth0.com/signup) and create a new tenant. Auth0 offers a generous free tier for up to 7000 active users and 2 social providers. You can also use an existing tenant so your user directory spans multiple websites/applications.

<img class="screenshot" src="//www.aerobatic.com/media/docs/auth0/create-tenant.png">

##### Step 2: Create Client

Create a new Auth0 client of type "Regular Web Application".

<img class="screenshot" src="//www.aerobatic.com/media/docs/auth0/create-client.png">

##### Step 3: Configure Client

In the **Allowed Callback URLs**, enter the URLs of your Aerobatic website including the leading `https://` **and** the path section corresponding to the protected section of the website. This corresponds to the value of the `path` property in the `aerobatic.yml`. For example: `https://your-website.aerobaticapp.com/members`. If the entire site is being protected by Auth0, then you should specify the root URL, i.e. `https://your-website.aerobaticapp.com`.

In the **Allowed Web Origins** and **Allowed Logout URLs**, just enter your base website URL, i.e. `https://your-website.aerobaticapp.com`.

Naturally these URL values would switch to your custom domain once you have that setup.

##### Step 4: Configure Connections

Now decide how you want new users to register. For username-password registration, you will need to setup a [Database Connection](https://auth0.com/docs/connections/database). You can also choose to enable one or more [Social/Enterprise](https://auth0.com/docs/identityproviders) identity providers. If you want to only support login via a 3rd party identity provider, you can omit the database connection.

Ensure that the connection is associated with your client.

<img class="screenshot" src="//www.aerobatic.com/media/docs/auth0/connection-settings.png">

### Hosted Login Page

Although Auth0 offers a number of ways to integrate the login/signup experience into your site, the Aerobatic auth0 plugin only supports the [hosted login page](https://auth0.com/docs/hosted-pages/login). Your login page is hosted by Auth0 directly at the URL `https://{your-tenant}.auth0.com`. If you have multiple Auth0 clients in the same tenant, this becomes your centralized login page which Auth0 [recommends as a best-practice](https://auth0.com/blog/authentication-provider-best-practices-centralized-login/). You can also use your own [custom domain](https://auth0.com/docs/custom-domains).

<img src="//www.aerobatic.com/media/docs/auth0/hosted-login-page.png">

The hosted login page can be customized within the Auth0 console. It is using the [Auth0 Lock](https://auth0.com/docs/libraries/lock/v11) widget. Lock suports a large number of [configuration options](https://auth0.com/docs/libraries/lock/v11/configuration), here are a few highlights:

| Option                                                                                                          | Description                                                                                                                                                  |
| --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [additionalSignUpFields](https://auth0.com/docs/libraries/lock/v11/configuration#additionalsignupfields-array-) | Collect additional inputs at registration for the username-password connection                                                                               |
| [theme](https://auth0.com/docs/libraries/lock/v11/configuration#theme-object-)                                  | Customize the logo, colors, and other looks and feel.                                                                                                        |
| [initialScreen](https://auth0.com/docs/libraries/lock/v11/configuration#initialscreen-string-)                  | Specify the initial screen shown - `login`, `signUp`, or `forgotPassword`. See [next section](#signup-login-link) for how to control this from your website. |

{{% alert tip %}}
**TIP: Logo Customization**

You can customize the image with the [theme.logo](https://auth0.com/docs/libraries/lock/v11/configuration#logo-string-) option. The docs indicate that you specify a URL, but you can also use an inline png. This is helpful when your entire website is protected by the auth0 plugin which would prevent you from hosting the image as part of your Aerobatic site - classic chicken or egg conundrum.

```js
{
  theme: {
    logo: "data:image/png;base64,iVBORw0KGgoAAAANSU...";
  }
}
```

You can use this [online tool](https://websemantics.uk/tools/image-to-data-uri-converter/) to convert an image to an inline base64 image for you. Just use an image that is near the final dimensions used by Auth0 Lock to avoid generating too large a base64 string.
{{% /alert %}}

### Signup / Login Link

If you are locking down your entire website un-authenticated users will be automatically redirected to the hosted login screen. However if your homepage is accessible to the public, you'll likely want a link for users to click to login or register. Rather than building this link yourself, the recommended approach is to link directly to the URL you want the new user to land on after logging in. This URL must match what was entered in the **Allowed Callback URLs** as part of the Auth0 client configuration. The auth0 plugin will redirect to the hosted login URL incorporating your **Client ID** that is configured in the plugin options.

```html
<a href="/members">Login or Sign-Up</a>
```

You can pass through Lock configuration options with query parameters. This is useful if you want distinct links for Login, Register, and even Forgot Password.

```html
<a href="/members?initial_screen=login">Login</a>
<a href="/members?initial_screen=signUp">Register</a>
<a href="/members?initial_screen=forgotPassword">Forgot Password</a>
```

These query parameters are accessible in the Auth0 hosted login page code via the `config.extraParams` object. Just use it to set the appropriate config option.

```js
{
  initialScreen: config.extraParams.initial_screen;
}
```

### Logout Link

You'll likely want a way for logged-in users to logout. Simply render a link to the base of the protected directory with the querystring `?__logout=1`.

```html
<!-- If the base of the protected part of the site is /members -->
<a href="/members?__logout=1">Logout</a>

<!-- If the entire site is protected -->
<a href="/?__logout=1">Logout</a>
```

This link will both destroy the `aerobatic-auth` cookie as well as log the user out of Auth0.

### Display Logged-In User Info

If you want to display the logged-in user's name, profile picture, or email in your website, in addition to the `auth0` plugin, you also need the [client-config](/docs/plugins/client-config) plugin. The `client-config` declaration must come _after_ the `auth0` plugin and _before_ the `webpage` plugin.

```yaml
plugins:
  - name: auth0
    path: /members
    options:
      clientId: your-auth0-client-id
      clientSecret: $AUTH0_CLIENT_SECRET
      tenant: your-tenant-name
  - name: client-config
  - name: webpage
```

This will render a snippet of inline JavaScript in the `<head>` of your html pages that looks like this:

```html
<script>
window['__aerobatic__']= {
  "versionId": "xxx",
  "appName": "xxx",
  "appId": "xxx",
  "user": {
    "name": "Roger Dodger",
    "nickname": "Roger",
    "user_id": "google-oauth2|11601620621887895232",
    "picture": "https://lh5.googleusercontent.com/-vQoXXpzdVuE/AAAAAAAAAAI/AAAAAAAAB7s/iKR3NS--yvQ/photo.jpg"
  }
};
</script>
```

The attributes of the `user` object correspond to the [Auth0 normalized profile schema](https://auth0.com/docs/user-profile/normalized/auth0#normalized-user-profile-schema).

Since the `window.__aerobatic__` variable is declared in the `<head>`, it will be available to JavaScript at any point in your `<body>` to render in the DOM. Obviously there's lots of ways to do this, but here's one simple implementation that avoids any [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content).

```html
<span id="username"></span>
<script>
  // Guard clause to prevent error when running the site locally in development
  if (window.__aerobatic__ && window.__aerobatic__.user) {
    document.getElementById('username').innerText = window.__aerobatic__.user.name;
  }
</script>
```

### Additional Auth0 Capabilities

Most all the Auth0 bells and whistles come along for the ride. Here's just a few of the additional capabilities you might want to tap into:

* [Send an email](https://auth0.com/docs/email) at different points in the registration lifecycle including account verification, welcome emails, and change password emails.
* [Set a password policy](https://auth0.com/docs/connections/database/password-options)
* Utilize [hooks](https://auth0.com/docs/hooks) to trigger custom logic at various trigger points. For example [post a message to a Slack channel](https://auth0.com/docs/hooks/extensibility-points/post-user-registration#example-integrate-with-slack) every time someone registers.
