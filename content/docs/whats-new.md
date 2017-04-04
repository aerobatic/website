---
title: What's New
name: whats-new
---

# What's New
Here's a running list of the latest new features and enhancements. Have an idea? Let us know at [support@aerobatic.com](mailto://support@aerobatic.com).

### Apr 4, 2017
* Announcing the new [form-submit-plugin](/docs/plugins/form-submit/) for collecting HTML form submissions from your Aerobatic websites! All forms are protected from bots by [Google reCAPTCHA](https://www.google.com/recaptcha/intro/invisible.html). Submissions can be viewed in the dashboard and also forwarded via email and webhook. One less reason for you to need a PHP or other active server backend for your website.

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
