---
title: Serverless Slack team invite form for your website
description: Put a Slack invite form on your site to allow vistors to join your public Slack by entering their email.
date: 2017-07-03
slug: serverless-slack-team-invite-form
---

<img src="/img/slack.svg" style="float: right; width: 150px;" />Slack has exploded in popularity in recent years as a tool for teams to collaborate. More recently it's also emerged as a way for companies and organizations to have direct conversations with **external** customers. This post describes how you can implement a Slack invitation form on your Aerobatic website that allows customers to enter their email to join the community. Slack will send them an invite with a link to complete the setup process. Aerobatic just [launched our own public Slack community](/slack) using the same technique described below.

There is an undocumented `/users.admin.invite` endpoint for the [Slack API](https://api.slack.com/web) that is the key to making this all work. The Aerobatic [http-proxy](/docs/plugins/http-proxy) plugin is used to securely pass the required OAuth token which should never be exposed in your HTML source code.

Many of the tricky details for this tutorial were taken directly from [outsideris/slack-invite-automation](https://github.com/outsideris/slack-invite-automation).

## Let's get started
I'll assume you already have a Slack team setup. If not, it may make sense to create a brand new team separate from your internal Slack team.

### Create Slack App

You'll need to create a dedicated Slack app for the invite form. This app will provide an OAuth token with the necessary permissions for inviting users.

1. Visit https://api.slack.com/apps and click **Create New App**. Make sure the **Development Slack Team** is set to the team that you will be inviting users to.
  ![Slack Create Application](https://www.aerobatic.com/media/slack-create-app-screenshot.png)

2. Click **Permissions**:
  ![Slack App Permissions](https://www.aerobatic.com/media/slack-app-permissions.png)

3. In **OAuth & Permissions** page, select admin scope under **Permission Scopes** menu and save changes.
  ![Slack App Scopes](https://www.aerobatic.com/media/slack-app-scopes.png)

4. Click **Install App to Team**
  ![Slack Install App](https://www.aerobatic.com/media/slack-install-app.png)

5. Copy **OAuth Access Token**
  ![Slack OAuth Token](https://www.aerobatic.com/media/--2/slack-oauth-access-token.png)


### Authorize App

Step **4** above makes it seem like the app permissions are all set to go. However there's an additional non-obvious step necessary to grant the "client" scope. You need to visit the following URL in your browser substituting the correct values for `CLIENT_ID` and `TEAM_ID`:

https://slack.com/oauth/authorize?&client_id=CLIENT_ID&team=TEAM_ID&install_redirect=install-on-team&scope=admin+client

* Your `CLIENT_ID` can be found in **Basic Information** settings of for the app that you just installed.
* Your `TEAM_ID` can be found at https://api.slack.com/methods/team.info/test.

### Configure http-proxy

Because the OAuth Token should remain a secret we don't want to expose it to the browser. The [http-proxy](/docs/plugins/http-proxy/) provides the ability to tack on secrets to the request. In this case the Slack API expects a `token` parameter either in the querystring or the form body. The proxy is not able to modify the POST body but it can append to the querystring. Add the following block of YAML to the `plugins` array in your `aerobatic.yml`:

~~~yaml
plugins:
  name: http-proxy
  path: /slack-invite
  method: post
  options:
    url: https://TEAM_NAME-public.slack.com/api/users.admin.invite
    query:
      token: $SLACK_OAUTH_TOKEN
~~~

Be sure to substitute the URL friendly form of your Slack team name for `TEAM_NAME`. The `$SLACK_OAUTH_TOKEN` is an environment variable. This is recommended to avoid committing the token value to source control. Set the environment variable with the following CLI command run from the root of your Aerobatic site (the same directory where your `aerobatic.yml` file resides):

~~~sh
aero env --name SLACK_OAUTH_TOKEN --value <token>
~~~

The `<token>` should be replaced with the access token copied in **step 5** above.

### Create invite form

The final step is to create an HTML form where visitors to your website can enter their email to receive an invite to the team. We'll use some JavaScript to intercept the form submit event and make a `fetch` call to the proxy endpoint. An appropriate message will be displayed to the user based on the Slack API response.

~~~html
<form id="inviteForm" method="POST">
  <input id="email" type="email" />
  <button type="submit">Send Invite</button>
</form>
<span id="alreadyInvited" style="display:none">
  You have already been invited.
  <a href="https://TEAM_NAME.slack.com" target="_blank">Visit the community on Slack</a>
</span>
<span id="alreadyMember" style="display:none">
  You are already a member.
  <a href="https://TEAM_NAME.slack.com" target="_blank">Visit the community on Slack</a>
</span>
<span id="success" style="display:none">
  <strong>Invitation sent!</strong> Check your inbox for an invite from Slack.
</span>
<span id="invalidEmail" style="display:none">
  Email is invalid
</span>
<span id="otherError" style="display:none">
  An unexpected error has occurred
</span>

<script>
  document.getElementById('inviteForm').addEventListener('submit', function(evt) {
    evt.preventDefault();

    var email = document.getElementById('email').value;
    fetch('/slack-invite', {
      method: 'POST',
      body: 'email=' + encodeURIComponent(email) + '&set_active=true',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(function(res) {
      return res.json();
    })
    .then(function(json) {
      if (json.error) {
        switch (json.error) {
          case 'already_invited':
            document.getElementById('alreadyInvited').style.display = 'block';
            break;
          case 'already_in_team':
            document.getElementById('alreadyMember').style.display = 'block';
            break;
          case 'invalid_email':
            document.getElementById('invalidEmail').style.display = 'block';
            break;
          default:
            document.getElementById('otherError').style.display = 'block';
            break;
        }
      } else {
        document.getElementById('success').style.display = 'block';
      }
    })
    .catch(function(err) {
      console.log(err);
    });
  });
</script>
~~~

### Start community building

That completes the implementation of the Slack invite form. Obviously you can dress it up with CSS to make it match the look and feel of your site. You can view our Aerobatic Slack invite form that was built using the technique just described at https://www.aerobatic.com/slack/.













