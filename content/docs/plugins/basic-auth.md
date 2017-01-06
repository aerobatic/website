---
title: Basic auth plugin
plugin: true
name: basic-auth
---

# Basic auth plugin

Sometimes you just need to provide a global basic username/password protection on an app. Often [HTTP basic authentication](https://en.wikipedia.org/wiki/Basic_access_authentication) is a “good enough” solution. This plugin lets you secure all or parts of your website with a common username and password.

We offer two flavors of basic auth: standard and custom. In standard mode the website visitor is presented with the browser's built-in login dialog. This gets the job done, but it isn't very aesthetic and offers no ability to put your own branding, messaging, etc. For this reason we offer [custom basic auth](#custom-auth), that lets you code your own login form html page from scratch.

<div class="row">
  <div class="col-md-6">
    <h4>Standard auth dialog</h4>
    <img src="//www.aerobatic.com/media/docs/--1/standard-auth-dialog.png" style="max-width:100%" alt="Standard auth login dialog">
  </div>
  <div class="col-md-6">
    <h4>Custom auth dialog</h4>
    <img src="//www.aerobatic.com/media/docs/custom-auth-dialog.png" style="max-width:100%" alt="Custom auth login dialog">
  </div>
</div>

### Configuration
~~~yaml
plugins:
  - name: basic-auth
    path: /protected
    options:
      username: $BASIC_AUTH_USERNAME
      password: $BASIC_AUTH_PASSWORD
      loginPage: login.html
      maxFailedLogins: 5
      failedLoginPeriod: 600

  - name: custom-errors
    options:
      errors:
        403: 403.html  # Display this error page if credentials incorrect
---
~~~

### Multiple credentials configuration

Rather than the `username` and `password` options, you can also specify a `credentials` array to support multiple pairs of valid credentials.

~~~yaml
plugins:
  - name: basic-auth
    path: /protected
    options:
      credentials:
      - username: user1
        password: $BASIC_AUTH_PASSWORD1
      - username: user2
        password: $BASIC_AUTH_PASSWORD2
      loginPage: login.html
---
~~~

#### Options

`username`
: The username for the website (environment variable recommended).

`password`
: The password for the website (environment variable recommended).

`credentials`
: An array of objects with keys `username` and `password`. If specified, this takes precedence over the individual `username` and `password` options.

`maxFailedLogins`
: Number of failed login attempts within the `failedLoginPeriod` before returning a `403 Forbidden` page. Optional, defaults to `10`.

`failedLoginPeriod`
: Number of seconds that defines the time span for `maxFailedLogins`. Optional, defaults to `600` (10 minutes).

`loginPage`
: File path to the custom login form page. If not specified the built-in browser login dialog will be used. Optional, only works for paid plans.

### Specifying what to protect
In the sample configuration above, the `path` for the plugin is set to only require authentication for requests to `/protected` including anything nested beneath. You can also choose to lock down the entire website by specifying `/` for `path` or omitting it all together.

It's also possible to configure multiple instances of the plugin mounted at different paths. For example you might have a dedicated section of your website for each client, each with their own unique login credentials. Here's how you could go about setting that up:

~~~yaml
plugins:
  - name: basic-auth
    path: /client1
    options:
      username: $CLIENT1_USERNAME
      password: $CLIENT1_PASSWORD

  - name: basic-auth
    path: /client2
    options:
      username: $CLIENT2_USERNAME
      password: $CLIENT2_PASSWORD
---
~~~

### Environment specific login

You may want to require a login only for specific [deploy stages](/docs/overview#deploy-stages). In this case you can include the optional `stages` property:

~~~yaml
plugins:
  - name: basic-auth
    stages: [test, preview]
    options:
      username: username
      password: $BASIC_AUTH_PASSWORD
---
~~~

<a id="custom-auth"></a>

### Custom HTML login form

While the built-in browser login dialog accomplishes the goal of requiring a username and password, it doesn't look very good and offers no ability to brand or provide additional copy. For this reason we offer custom basic auth, that allows you to code a `login.html` page from scratch that gives you full control over the login experience. Simply add your login page to your repo and specify the path in the `loginPage` option of the `basic-auth` plugin.

~~~yaml
plugins:
  - name: basic-auth
    options:
      username: username
      password: $BASIC_AUTH_PASSWORD
      loginPage: login.html
---
~~~

The form markup needs to be decorated with the `data-basic-auth-form`, `data-basic-auth-username`, and `data-basic-auth-password` attributes as shown below. The `data-basic-auth-error` element will only be shown if invalid credentials are submitted.

~~~html
<div class="error" data-basic-auth-error>Invalid credentials</div>
<form method="post" data-basic-auth-form>
  <label for="username">Username</label>
  <input type="text" id="username" data-basic-auth-username>
  <label for="password">Password</label>
  <input type="password" id="username" data-basic-auth-password>
  <input type="submit" value="Submit">
</form>
~~~

Aerobatic injects a snippet of JavaScript into your login page that intercepts the form submit event and posts the credentials in the `Authorization` header to the path where the `basic-auth` plugin is mounted. If the credentials are correct, the real HTML page for the current URL is returned and loaded in the browser. The credentials are cached in [Windows.sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage), so they are automatically cleared when the browser tab is closed. Subsequent requests within the same session will use the cached credentials so the user is not required to re-authenticate.

### Max login attempts
In order to prevent a potentially malicious user from brute force guessing username/password combinations, we track the number of failed login attempts from a given IP address. If the number of failures from the same IP within the `failedLoginPeriod` exceeds the `maxFailedLogins` option, the `403 Forbidden` error page is returned. That IP will be blocked from attempting any further logins until the failed login period has elapsed. You can customize the 403 error page using the [custom-errors plugin](/docs/custom-error-pages).

### Logout links
When utilizing custom basic auth, the website visitor is implicitly logged out when the browser tab is closed. For standard basic auth, each browser vendor has their own policy for how long the credentials are cached. You may want to provide your websites visitors a logout link that forces the credentials to be cleared immediately. All you need to do is include an anchor element within pages that require authentication decorated with a `data-basic-auth-logout` attribute. The `href` attribute should be the destination you want the user to be navigated to upon logging out. This works with both the standard and custom versions of the plugin.

~~~html
<a href="/" data-basic-auth-logout>Logout</a>
~~~

### Security considerations
The `basic-auth` plugin is intended as a simple, lightweight authentication mechanism, not a robust identity and access management solution. Be aware that the Base64 encoded credentials are cached in the browser for some period of time. It's recommended that credentials be configured as environment variables rather than hardcoded in the `aerobatic.yml` and committed to source control. Aerobatic enforces SSL 100% of the time, so credentials will always be encrypted over the wire.

#### Auth demo website
- Here is a sample website that uses the Aerobatic basic-auth plugin. [http://auth-demo.aerobatic.io/](http://auth-demo.aerobatic.io/)
- The code for this sample site can be found on Bitbucket at [https://bitbucket.org/aerobatic/auth-demo/src](https://bitbucket.org/aerobatic/auth-demo/src)
