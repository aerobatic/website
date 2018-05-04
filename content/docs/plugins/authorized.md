---
title: Authorized plugin
plugin: true
name: authorized
---

# Authorized plugin

The authorized plugin works in conjunction with the [auth0 plugin](/docs/plugins/auth0/) to provide more fine-grained access control based on the logged in user's roles. User roles are managed using the [Auth0 Authorization Extension](https://auth0.com/docs/extensions/authorization-extension/v2). You can declare multiple instances of the plugin to control access to different paths with different role requirements.

### Configuration

```yaml
plugins:
  - name: auth0
    options:
    clientId: $AUTH0_CLIENT_ID
    clientSecret: $AUTH0_CLIENT_SECRET
    tenant: auth0-tenant-name

  - name: authorized
    path: /admin
    options:
      roles: ['administrator']

  - name: authorized
    path: /subscribers
    options:
      roles: ['subscriber]
```

{{% alert tip %}}
The `authorized` plugin **only** has an effect when the `auth0` plugin is mounted at a parent to the path where authorization is taking place.
{{% /alert %}}

Roles are defined in the Auth0 user's `app_metadata`

## Configure Auth0 authorization

Here are the steps involved in getting authorization setup in Auth0:

1.  [Install the Authorization Extension](#installing-authorization-extension)
2.  [Configure the Authorization Extension](#configuring-authorization-extension)
3.  [Create custom token rule](#create-token-authorization-rule)
4.  [Create roles and assign users](#create-roles-assign-users)

### Installing Authorization Extension {#installing-authorization-extension}

In order to manage roles and user-role assignments, you need to install the [Auth0 Authorization Extension](https://auth0.com/docs/extensions/authorization-extension/v2). Login to your Auth0 dashboard and click the **Extensions** link in the left navigation bar.

<img class="screenshot" src="http://www.aerobatic.com/media/docs/auth0/authorization-extension-install.png" alt="Auth0 Authorization Extension Install">

### Configuring the Authorization Extension {#configuring-authorization-extension}

Configure the extension to store persist the roles in the application metadata:

<img class="screenshot" src="http://www.aerobatic.com/media/docs/auth0/authorization-extension-configuration.png" alt="Auth0 Authorization Extension configuration">

This will sync the roles from the extension into the `app_metadata` section of the user profile whenever a user logs in. The result will look something like so:

```json
{
  "authorization": {
    "roles": ["subscriber"]
  }
}
```

{{% alert warning %}}
The `authorization` section will not be synced to the `app_metadata` of already logged in users. After you assign a user to one or more roles, they will need to logout and back in again for it to take effect.
{{% /alert %}}

#### Create token authorization rule {#create-token-authorization-rule}

Finally you need to create an Auth0 rule that will append the `authorization` data from `app_metadata` to the login token. This is what enabled Aerobatic to make authorization decisions based on their assigned roles.

1.  In the Auth0 dashboard, click the **Rules** link in the left navigation
2.  Click the **Create Rule** button
3.  Select the **empty rule** template
4.  Change the rule name to "Add authorization to token"
5.  Paste in the code below and click **Save**

```js
function (user, context, callback) {
  // Change the namespace variable below to something specific to your organization. The value
  // doesn't necessarily have to match your app url, but it doesn't hurt.
  const namespace = 'https://auth0-demo.aerobaticapp.com';
  if (user.app_metadata) {
    context.idToken[namespace + '/authorization'] = user.app_metadata.authorization;
  }

  callback(null, user, context);
}
```

Now you will have two rules: "auth0-authorization-extension" which was created by the authorization extension, and the new custom "Add authorization to token" rule.

<img class="screenshot" src="http://www.aerobatic.com/media/docs/auth0/authorization-rules.png" alt="Auth0 authorization rules">

### Create roles and assign users {#create-roles-assign-users}

After installing the authorization extension, there should now be a **Authorization** link in the Auth0 dashboard left navigation. Click on it to launch the authorization management window. Click the **Roles** link in the left navigation then click the **Create Role** button. In the **Application** drop down, you should select the Auth0 client that you setup to represent your Aeroatic application [for the auth0 plugin](/docs/plugins/auth0/#step-2-create-client).

<img class="screenshot" src="http://www.aerobatic.com/media/docs/auth0/create-role.png" alt="Auth0 create role">

Once at least one role has been created, you can assign users to those roles:

<img class="screenshot" src="http://www.aerobatic.com/media/docs/auth0/auth-user-roles.png" alt="Auth0 user roles">

In the screenshot above, we've assigned the user to a role called "subscriber". When this user next logs in, they will be authorized to access any section of the site that requires this role. Here's how that would be configured in the `aerobatic.yml`:

```yaml
plugins:
  - name: auth0
    options:
    clientId: $AUTH0_CLIENT_ID
    clientSecret: $AUTH0_CLIENT_SECRET
    tenant: auth0-tenant-name

  - name: authorized
    path: /subscribers
    options:
      roles: ['subscriber]
```

## Access denied error page

If a logged-in user attempts to access a page but lacks one of the required roles, a `403 Forbidden` error page is returned. You can use the [custom-errors plugin](/docs/plugins/custom-errors/) to display your own custom response.

```yaml
plugins:
  - name: custom-errors
    options:
      errors:
        403: forbidden.html
```

## Accessing user authorization in your html

You might want to tweak what is displayed on your site based on the logged-in user's authorization. For example, maybe you have an admin section locked down to the `admin` role, and you want a link in your navigation that only displays for administrators. The `authorization` object from the Auth0 `app_metadata` is exposed in the Aerobatic user object. You can use the technique described in the auth0 plugin docs for [displaying logged in user info](/docs/plugins/auth0/#display-logged-in-user-info).

Here's how you might go about conditionally displaying that admin link:

```html
<a id="admin-link" class="hidden" href="/admin">Admin</a>
<script>
  // You would want to guard against undefined here
  if (window['__aerobatic__'].user.authorization.roles.indexOf('admin') >= 0) {
    document.getElementById('admin-link').classList.remove("hidden");
  }
</script>
```
