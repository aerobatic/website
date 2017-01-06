---
layout: docs
title: Migrating from Bitbucket add-on
---

# Migrating from Bitbucket add-on

If you are an existing customer of the Aerobatic Bitbucket add-on, this guide walks you through migrating your site to our new standalone platform. Your actual deployed site will not suffer any service interruption as part of the migration process. The underlying hosting infrastructure is largely unchanged, the main difference is that you will now interact with Aerobatic via the web control panel at [https://control.aerobatic.com](https://control.aerobatic.com).

{% alert warning %}
**IMPORTANT** Aerobatic is changing from a Bitbucket add-on to a standalone service, but your website source code can absolutely continue to live in Bitbucket. These migration steps assume that your repository will remain right where it is.
{% endalert %}

You'll still enjoy the same continuous deployment workflow as before, but now [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines) will provide the automated build infrastructure.

### Logging into new Control Panel

The first step in making the move is to [login to the new Control Panel](https://control.aerobatic.com/login). The email address you login with is the same as your Bitbucket account, but the password is different. A temporary password was sent to all existing customers, however if you didn't receive the email, or you can't locate it, you can visit the [forgot password page](https://control.aerobatic.com/forgot) to reset it.

### Migrating your websites

Once logged in to the control panel, click the "Bitbucket Migrate" link in the navigation. This will present a list of all your Bitbucket websites. Click the button next to the website you want to migrate and the app will provide you contents to use for the new `aerobatic.yml` and `bitbucket-pipelines.yml` files that you will need to create in your repo.

### Create the `aerobatic.yml`
Create a new file at the root of your website repo named `aerobatic.yml`. Paste the contents provided. At a minimum, the file requires a single `id` property with your repo ID:

~~~yaml
id: "<your bitbucket repo_id>"
---
~~~

If you created the file on your local machine, rather than within the Bitbucket web interface, push the change.

### Configuring Pipelines

**1.** First step is to enable Pipelines for your repo. It should be there in the left nav in Bitbucket:

  <img src="/img/pipelines-menu-link.png" style="max-height: 80px;" />

**2.** Click the "Enable Pipelines" button

**3.** On the next screen where it says "Pipelines is now **enabled**" just click the **Next** button.

**4.** Bitbucket will now open the browser editor for the `bitbucket-pipelines.yml` file. Overwrite the default contents with the YAML supplied in the control panel migration success page. Click the **Commit** button.

<img class="screenshot" src="/img/pipelines-yaml-editor.png">

**5.** This will trigger your first Pipelines build, however the deployment to Aerobatic will fail because we haven't configured the `AEROBATIC_API_KEY` environment variable yet.

{% alert tip %}
**TIP:** Steps **6** and **7** below only have to be done **once** per Bitbucket individual or team account. For subsequent websites, the `AEROBATIC_API_KEY` will already be set to go.
{% endalert %}

**6.** To get the value of your Aerobatic api key, you first need to have the CLI installed. If you don't have the CLI installed yet, do so by running:

{% bash %}
npm install aerobatic-cli -g
{% endbash %}

Now login to the CLI with the same credentials you used to login to the Control Panel:

{% bash %}
aero login
{% endbash %}

When your account was migrated, an identically named Aerobatic account was created for all Bitbucket accounts you belong to (both individual and team) that had the Aerobatic add-on installed. You need to ensure the CLI is set to use the same account that the repo belongs to:

The `switch` command will display all the Aerobatic account you are associated with. Use the arrow keys to select the appopriate account.

{% bash %}
aero switch
{% endbash %}

Now you can run the `apikey` command:

{% bash %}
aero apikey
{% endbash %}

This will print out the value of your api key. Keep this window open as you'll need that value momentarily.

**7.** Back in Bitbucket, visit your Bitbucket account settings (not the repo settings). At the very bottom of the left nav should be a **PIPELINES** section. Click the **Environment variables** link.

Create a new environment variable named `AEROBATIC_API_KEY` and paste in the long random string that was output by the `aero apikey` command. Click the **Secured** checkbox to encrypt the value and click **Save**.

<img class="screenshot" src="/img/pipelines-env-variables.png" />

**8.** Now go back to your repository and click the **Pipelines** link again. Next to the previous failed build you'll see a small retry icon. Go ahead and click that and this time the deployment should succeed.

<img class="screenshot" src="/img/pipelines-success.png" />

**9.** You now have continuous deployment from Bitbucket Pipelines to Aerobatic hooked up. For more advanced deployment workflows using branches and deployment stages, see the blog post [Deploy stages with Bitbucket Pipelines](/blog/deploy-stages-with-bitbucket-pipelines).
