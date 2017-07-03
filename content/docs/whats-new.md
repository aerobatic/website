---
title: What's New
name: whats-new
---

# What's New
Here's a running list of the latest new features and enhancements. Have an idea? Let us know at [support@aerobatic.com](mailto://support@aerobatic.com).

### July 3, 2017
* [New blog post](/blog/serverless-slack-team-invite-form/) demonstrating how to implement a Slack team invite form on your website.

### June 23, 2017
* Announcing our new [Organization pricing plan](/blog/announcing-organization-pricing-plan/) geared towards digital agencies developer teams. Every new site automatically available as a sub-domain on your organizations root domain.

### June 2, 2017
* By popular demand the [password-protect](/docs/plugins/password-protect/) plugin now supports the ability to [configure a username](/docs/plugins/password-protect/#usernames) in addition to a password. You can also declare a list of up to 10 username/password credential pairs.

### May 30, 2017
* Announcing the new [Aerobatic theme gallery](/themes/) makes it super simple to kickstart your next Hugo, Jekyll, or vanilla HTML5 site from a pre-packaged theme or template. Just pass the `--theme` option to the `aero create` command. For example: `aero create jekyll/freelancer`.
* Now you can tack the query parameter `__preview` to any Aerobatic site URL to launch the site in a special device viewer that let's you toggle between desktop, laptop, tablet, or phone. [Read more](/docs/overview/#device-preview).

### May 5, 2017
* The new [keyword-search](/docs/plugins/keyword-search/) plugin is now available. All Aerobatic sites can now offer full text search of site content without reliance on any external services. You can provide a custom search results template for a fully integrated user experience.

### Apr 24, 2017
* [Announcing the new metrics section](/blog/introducing-website-metrics/) in the Aerobatic dashboard for gleaning insights into the traffic on your website including: visits, page views, top pages, visitor locations, traffic source, and more.

### Apr 4, 2017
* Announcing the new [form-submit-plugin](/docs/plugins/form-submit/) for collecting HTML form submissions from your Aerobatic websites! All forms are protected from bots by [Google reCAPTCHA](https://www.google.com/recaptcha/intro/invisible.html). Submissions can be viewed in the dashboard and also forwarded via email and webhook. One less reason for you to need a PHP or other active server backend for your website.
* [New blog post](/blog/form-submit-zapier-google-spreadsheet/) demonstrating how to connect the form-submit plugin to a Google spreadsheet using Zapier.

### Mar 24, 2017
* We now support [email or Slack deploy alerts](/docs/configuration/#deploy-alerts) that you configure in your `aerobatic.yml` file. You can even specify different alerts based on the deploy stage that was updated. Great way for agencies to automatically notify clients when changes are made.

### Mar 15, 2017
* New [sample website](https://password-protect-demo.aerobatic.io) demonstrating use of the [password-protect](/docs/plugins/password-protect/) plugin.

### Mar 13, 2017
* You can now pass a `-f` or `--format` option to the [aero logs](/docs/cli/#logs) command to see the raw JSON weblog entries in their entirety. There is also an additional `proxyUrl` property in the log entry for requests that are handled by the [http-proxy](/docs/plugins/http-proxy/) plugin. This is useful when diagnosing exactly what URL Aerobatic is requesting behind the scenes. The [plugin troubleshooting](/docs/plugins/http-proxy/#troubleshooting) section has more details.

### Mar 6, 2017
* You can now pass a `-n` or `--name` option to the [aero create](/docs/cli/#create) CLI command to control the website name at time of creation.
* Deployments using the [aero deploy](/docs/cli/#deploy) CLI command are now up to 150% faster due to a new S3 key naming scheme that allows for faster uploads.

### Feb 10, 2017
* Announcing [optimized Docker images](/blog/optimized-docker-images-continuous-deployment/) for building your Jekyll or Hugo sites and deploying to Aerobatic.

### Feb 8, 2017
* The aerobatic-cli [deploy command](/docs/cli/#deploy) now takes advantage of [S3 transfer acceleration](http://docs.aws.amazon.com/AmazonS3/latest/dev/transfer-acceleration.html) for faster uploads.

### Feb 1, 2017
* Introduced new [password-protect](/docs/plugins/password-protect/) plugin, a simple and effective way to protect all or parts of your website with a password.
* New [client-config](/docs/plugins/client-config/) plugin for exposing config settings to your client JavaScript.

### Jan 26, 2017
* Aerobatic relaunches as a standalone CLI and dashboard. Now you can deploy your website right from your local terminal or from any CI service build script.
