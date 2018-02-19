---
title: Introducing the AeroAgency workflow for agencies and freelancers
description: Introducing the aero-agency workflow for agencies delivering website projects for clients
comments: true
date: 2017-03-27
tags: agency, freelancer, workflow, aero
slug: aero-agency-flow-for-agencies-freelancers
hidden: true
---

{{% alert warning %}}
This blog post describes some features that don't actually exist yet such as **push requests**.
{{% /alert %}}

In this post I describe a workflow for digital agencies and freelancers building website projects on behalf clients using static site generators such as Jekyll, Hugo, or Middleman. It leverages Aerobatic's support for [deploy stages](/docs/overview/#deploy-stages) to provide an isolated preview URL for the client to preview and approve changes before being deployed to the actual production URL. The workflow also takes full advantage of the Aerobatic [password-protect](/docs/plugins/password-protect/) plugin to ensure the preview URL can only be accessed by the client and not the general public.

The workflow has 3 distinct phases: pre-launch, launch, and post-launch.

## Pre-launch Phase

This is the first phase of the client engagement. At this point scope has been agreed upon and perhaps some image mockups have been discussed. Now it's time to start actual coding of the first draft of the website (which could be as simple as a "Coming Soon" landing page).

![Prelaunch flow](https://www.aerobatic.com/media/diagrams/aero-agency-flow-prelaunch.png)

Here's a breakdown of each step:

1. Create the website using: `aero create --name project-name`
2. Using a static site generator like Hugo or Jekyll, develop the initial draft of the site.
3. Configure the [password-protect](/docs/plugins/password-protect/) plugin in the `aerobatic.yml` file so only the client will be able to access it.
4. Deploy the site by running: `aero deploy`
5. Re-deploy the site as often as necessary before you are at a state where you are ready to solicit feedback from the client.
6. Email or message the client with the website URL `https://project-name.aerobaticapp.com` along with the site password.
7. Once the client is satisfied with the initial release, you're ready to move on to the next phase.

## Launch Phase

Once the initial release is ready in preview, the website needs to be upgraded to the Pro Plan to enable a custom domain to be provisioned.

![Launch phase](https://www.aerobatic.com/media/--1/diagrams/aero-agency-flow-launch.png)

There are two supported payer models:

* **Agency payer** - the agency assumes the monthly Aerobatic subscription fees as part of the service they offer to clients.
* **Client payer** - the Aerobatic subscription fees are paid directly by the client.

#### Transferring site to client

If the client payer model is more appealing, the agency should transfer the website over to the client:

* Have the client signup for their own Aerobatic account at https://dashboard.aerobatic.com/register.
* Enter the client's email address in the transfer form found in the website settings section of the dashboard. They will be sent a link to complete the process. The Aerobatic users from the agency team where the website originated will automatically be granted access to the client's Aerobatic team so they can continue to contribute to the site.

#### Upgrade to Pro Plan

Whomever is the owner of the site now will need to upgrade it to the Pro Plan using the simple and secure checkout screen.

#### Register custom domain

Now that the website has been upgraded, a custom domain can be registered using the command: `aero domain --name client-domain.com`. Once the domain has been provisioned, an email will be sent with the proper DNS settings. Depending on the level of technical expertise of the client, developers from the agency may need to assist in getting the DNS settings in place. All custom domains registered with Aerobatic automatically come with a wildcard SSL certificate and all site traffic is forced over https. See the [custom domains and SSL docs](/docs/custom-domains-ssl) for full details.

#### Launch the site

After DNS is setup, you verify it resolves correctly by browsing to the custom domain. Now update the `aerobatic.yml` so the `password-protect` plugin is only enabled for the `preview` stage:

```yaml
plugins:
  - name: password-protect
    stages: [preview]
    options:
      password: $SITE_PASSWORD
```

Now do one more deployment:

```sh
[$] aero deploy --message "Turn off password-protect"
```

**Congratulations, you are live in production!**

## Post Launch Phase

In the post-launch phase the website continues to be iterated on. Remember the coding done in the pre-launch phase may have been nothing more than a "Coming Soon" page &mdash; in which case the post-launch phase is where the vast majority of work happens. Now that the production URL is live, we need a different URL for the client to preview and approve changes. That's where Aerobatic [deploy stages](/docs/overview/deploy-stages/) come into play.

![Post Launch phase](https://www.aerobatic.com/media/diagrams/--1/aero-agency-flow-postlaunch.png)

Let's walk through each step:

1. Client requests changes are made. Or maybe the agency is working off of a backlog of features.
2. The agency developer codes up the changes and deploys them to the preview stage with the command: `aero deploy --stage preview`. The updates will then be available at a URL like `https://www--preview.client-domain.com`. This URL will be password protected even though the production site is not since the plugin is now only enabled for the preview stage.
3. Developer issues a "push request" (more about that next) for the client to review changes on the preview URL.
4. If the client accepts the updates, they simply click the "Approve" button. This will automatically promote the version from `staging` to `production`, no further action required by the developer.
5. If the client would like additional changes made before pushing to production, they simply reply to the email with feedback.
6. Keep repeating steps 1-5.

## Push requests

A push request is just a request by the agency to promote (or "push") a version deployed in the `preview` stage up to production. The idea is that the client is the one that determines when and what is deployed to the production site.

{{% alert tip %}}
It's worth noting that approving a PR doesn't actually physically deploy anything, it's just switching the version that the production URL points to in the Aerobatic website metadata &mdash; it's the exact same code as what is served from the preview stage URL.
{{% /alert %}}

A push request can be made either via the CLI or in the dashboard. From the CLI, just run the `pr` command specifying the stage to push from and the email address to send the request to:

```sh
[$] aero pr --stage preview --email sally@client.co --message "Added new legal page"
```

### Source control and continuous deployment

The AeroAgency workflow can be used independently of any particular source control system, however we do have some suggested best-practices:

* First off, please DO keep your code in source-control.
* For teams with multiple developers there are definite advantages to setting up continuous deployment from git. We have multiple tutorials covering different popular CI services on our [continuous deployment guide](/docs/continuous-deployment/). In this arrangement, rather than running `aero deploy` from the developer machine, the developer just pushes code to git which triggers the CI service that builds the static site generator and deploys to Aerobatic. For freelancers, this might be overkill so we'd suggest starting off deploying with the CLI locally and introduce CI later if needed.
* Code being deployed to the preview stage should be located in a branch other than **master**. You might even call the branch **preview** for consistency. Then merge from **preview** to **master** as push requests are approved by the client.

### CMS Integration

TODO: Talk about integration with CMS tools such as Contentful, Forestry.io, DatoCMS
