---
title: Password protect plugin
plugin: true
name: password-protect
---

# Password protect plugin

{{% alert tip %}}
If you are looking for a full-featured identity management solution with individual user registrations and credentials, you might be more interested in our [auth0 plugin](/docs/plugins/auth0/).
{{% /alert %}}

The `password-protect` plugin is an easy way to require a password from visitors to access all or parts of your website. You can use our password form, or provide your own fully custom html login page. Like all plugins, password protection can be enabled only for [specific deploy stages](#deploy-stages).

By default the plugin only requires users to enter a password. However you can configure it to require both a username and a password. See the [Usernames](#usernames) section for more details.

See the plugin in action on our [demo site](https://password-protect-demo.aerobaticapp.com) ([source code](https://github.com/aerobatic/password-protect-demo)).

### Configuration

```yaml
plugins:
  - name: password-protect
    path: /protected
    options:
      password: $SITE_PASSWORD
      loginPage: login.html
      maxFailures: 5
      failureWindow: 600
      lockoutDuration: 600
      ignorePatterns: []
      username: $USERNAME
      credentials:
        - username: user1
          password: $PASS1
        - username: user2
          password: pass2
```

### Options

{{% option "password" %}}
The value of the password that needs to be entered to access the site. Using an [environment variable](/docs/configuration/#environment-variables) is recommended. You can also set to a list of valid passwords.
{{% /option %}}

{{% option "loginPage" %}}
The path to your custom `.html` login file. See the custom login form instructions below. If omitted, a simple responsive login form will be rendered for you.
{{% /option %}}

{{% option "ignorePatterns" %}}
Array of url patterns to not enforce password protection for. For example `[/css/*.css]`. Don't worry about `robots.txt` or `favicon.ico` &mdash; they are ignored by default.
{{% /option %}}

{{% option "maxFailures" %}}
The maximum incorrect passwords that can be submitted from a given IP in the `failureWindow` before locking that IP out. Defaults to 5.
{{% /option %}}

{{% option "failureWindow" %}}
The number of seconds in the window of time to track incorrect password attempts. Defaults to 600 (10 minutes).
{{% /option %}}

{{% option "lockoutDuration" %}}
The number of seconds an IP address is prevented from any further password attempts if more than `maxFailures` attempts was made in the `failureWindow`. While the account is locked out, a `403 Forbidden` error will be returned.
{{% /option %}}

{{% option "cookieExpiresMinutes" %}}
How long before the cookie expires and the visitor will be re-prompted to login. If omitted, the cookie will be a session cookie and last until the browser is closed. If you'd like the visitor to be able to close their browser and access the protected portions of your site without re-entering the password, you can explicitly set this option.
{{% /option %}}

{{% option "username" %}}
The login username. If omitted from the options then only a password is required. See [Usernames](#usernames) for more details.
{{% /option %}}

{{% option "credentials" %}}
An array of `username` and `password` objects for supporting multiple sets of valid credentials. This replaces the individual `username` and `password` options. See [Multiple Credentials](#multiple-credentials) for more details.
{{% /option %}}

### Specifying what to protect

You can choose to protect your entire website or just a specific sub-folder.

**Protect entire site**

```yaml
plugins:
  - name: password-protect
    options:
      password: $SITE_PASSWORD
```

**Protect a sub-directory**

```yaml
plugins:
  - name: password-protect
    path: /private
    options:
      password: $SITE_PASSWORD
```

### Custom login form

To provide your own html password page, just specify a value for the `loginPage` option. The value is a file path relative to the root of your site, not a URL path. The html should include a `<form method="POST">` tag. The `action` attribute can be omitted since the form should post back to the same URL. There should be a single password input in the form whose `name` attribute **must** be set to `aerobatic-password`.

```html
<form method="POST">
  <input type="password" name="aerobatic-password" />
  <button type="submit">Log in</button>
</form>
```

**Invalid password error**

If the user enters the wrong password, Aerobatic will issue a `302` redirect back to the same URL with a `?fail=1` in the query string. You can check for this with JavaScript and display an error message.

```html
<script>
if (/fail=1/.test(location.search)) {
  document.write('<div class="error">Incorrect password</div>');
}
</script>
<form method="POST">
  <input type="password" name="aerobatic-password" />
  <button type="submit">Log in</button>
</form>
```

**Branding and styling the custom login page**

Chances are you want to use a stylesheet or some imagery on the login page. But when password protecting the root of your website, you're also password protecting nested stylesheets and images. This will result in broken links on your login page. To get around this, use the `ignorePatterns` property to specify that your images, stylesheets, etc. do not enforce a password. You don't necessarily have to do this for all assets, just those specifically needed by your custom login page.

```yaml
plugins:
  - name: password-protect
    path: /
    options:
      password: $SITE_PASSWORD
      ignorePatterns:
        - css/login.css
        - images/login/*.jpg
```

This is less of an issue if you are protecting a sub-directory. In that case your login page assets can live outside the protected directory.

### Logout link

If you'd like to have a logout link on the protected pages, you can simply create a link with the querystring `__logout=1`.

```html
<a href="/?__logout=1">Log out</a>
```

The same can be accomplished with a `<form>`. This can be helpful to avoid needing to include any path portion in the logout link since a form with no `action` attribute will target the current URL.

```html
<form method="GET">
  <input type="hidden" name="__logout" value="1" />
  <button type="submit">Log out</button>
</form>
```

### Cross site login

The same html form post for submitting the password will also work across sites. So if you have another site that your employees or customers have to login to (or that sits behind the firewall of a private network), you can include a simple HTML snippet to automatically log into your password protected Aerobatic site without having to enter the password manually.

On your other secured site, add HTML like the following:

```html
<form method="POST" action="https://youraerobaticsite.com">
  <input type="hidden" name="aerobatic-password" value="[YOUR SITE PASSWORD]" />
  <button type="submit">Open Aerobatic site</button>
</form>
```

If you want to launch a new browser tab, add the attribute `target="_blank"` to the form.

{{% alert "warning" %}}
**CAREFUL!** This technique involves exposing the password in the HTML source of the linking site. Ensure this site is running on HTTPS and that the only people with access are those that should have access to the password protected Aerobatic site. **Never embed your site password in the view-source of a publicly accessible web page!**
{{% /alert %}}

### Multiple protected sections

You can even declare multiple instances of the `password-protect` plugin to protect different parts of your site. The enables scenarios such as having a private sub-directory for each of several business clients:

```yaml
plugins:
  - name: password-protect
    path: /client1
    options:
      password: $CLIENT1_PASSWORD
  - name: password-protect
    path: /client2
    options:
      password: $CLIENT2_PASSWORD
```

### Deploy stages

A common use case is to only enable password protection on a staging or preview instance of the site. That enables locking down un-released changes to a controlled audience. Then when you're ready to make the changes public, either re-deploy to the production stage, or push the staged version to production in the dashboard or with the [aero versions](https://www.aerobatic.com/docs/cli/#versions) CLI command.

Here's an example declaration that only enables password protection for the `test` deploy stage, i.e. `https://test.yourdomain.com`. The production site `https://yourdomain.com` would not require a password.

```yaml
plugins:
  - name: password-protect
    stages: [test]
    options:
      password: $CLIENT1_PASSWORD
```

Read more about [deploy stages](/docs/overview/#deploy-stages).

### Multiple passwords

If you want to have more than one valid password you can do so by setting the `password` property to an array (with a max length of 10):

```yaml
plugins:
  - name: password-protect
    options:
      password: [$PASSWORD1, $PASSWORD2, $PASSWORD3]
```

### Usernames

By default the plugin only requires users to enter a password. However you can also configure it to require both a username and password. This works both for the default login form and custom login forms. Just include a `username` option in the YAML declaration:

```yaml
plugins:
  - name: password-protect
    options:
      username: $USERNAME
      password: $PASSWORD
```

For a custom login form, include an `<input>` with the `name` **aerobatic-username** in your login.html:

```html
<script>
if (/fail=1/.test(location.search)) {
  document.write('<div class="error">Incorrect username or password</div>');
}
</script>
<form method="POST">
  <input type="text" name="aerobatic-username" placeholder="Username" />
  <input type="password" name="aerobatic-password" placeholder="Password" />
  <button type="submit">Log in</button>
</form>
```

### Multiple Credentials

Rather than setting a single `username` and `password` options, you can instead specify a `credentials` array with up to 10 username/password pairs:

```yaml
plugins:
  - name: password-protect
    options:
      credentials:
        - username: user1
          password: $PASS1
        - username: user2
          password: $PASS2
```
