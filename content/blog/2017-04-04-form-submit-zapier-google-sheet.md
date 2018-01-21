---
title: Post form submissions to a Google spreadsheet with Zapier
description: Show how to use the form-submit plugin to append to a Google spreadsheet using Zapier
date: 2017-04-03
tags: sub-domain, javascript, spa, wildcard
slug: form-submit-zapier-google-spreadsheet
---

The Aerobatic [form-submit](/docs/plugins/form-submit/) plugin allows you to collect form submissions from your static website. One of the targets you can specify is a webhook which enables all sorts of interesting integration possibilities. Combined with [Zapier](https://zapier.com), it's simple to send your form submissions to a wide range of online services including: [Mailchimp](https://zapier.com/zapbook/zaps/1431/add-mailchimp-list-subscribers-from-a-webhook/), [Twilio](https://zapier.com/zapbook/zaps/1690/send-webhook-as-an-sms-message-with-twilio/), [Hubspot](https://zapier.com/zapbook/zaps/10642/make-hubspot-form-submissions-from-webhooks/), [Salesforce](https://zapier.com/zapbook/zaps/1751/add-a-new-salesforce-lead-from-a-webhook/), and [many more](https://zapier.com/zapbook/webhook/).

In this blog post we'll explore how to append each submission of a simple online contact form to a Google spreadsheet. We've chosen a spreadsheet since it's a familiar way to manage data, but the steps for integrating Aerobatic with other services via Zapier will work in a similar manner.

![Form to webhook to Google sheet](https://www.aerobatic.com/media/blog/form-submit-webhook-google-sheet.png)

If you're unfamiliar with Aerobatic static plugins, check out [this introduction](https://www.aerobatic.com/docs/configuration/#plugins). The code examples for this post are based on the [form-submit-demo](https://form-submit-demo.aerobaticapp.com) [[source code](https://github.com/aerobatic/form-submit-demo)].

## First create the form

There's nothing fancy here, just code up a standard HTML form the way you normally would. Just be sure to set the `method` to "POST" and the `target` attribute to the path that the plugin is mounted at, in our case `/contact-us`. You can perform your own client-side form validation with JavaScript or use [HTML5 form validation](http://www.the-art-of-web.com/html/html5-form-validation/). By default the full page is refreshed upon submission, but you can also intercept the `submit` event with JavaScript and post with AJAX. The [demo site](https://github.com/aerobatic/form-submit-demo) shows both techniques.

~~~html
<form target="/contact-us" method="post">
  <label for="name">Name</label>
  <input type="text" required name="name">

  <label for="email">Email</label>
  <input type="email" required name="email">

  <label for="message">
  <textarea name="message"></textarea>
  <button type="submit">Submit</button>
</form>
~~~

### Preventing spam

Your form will need a [Google reCAPTCHA](https://www.google.com/recaptcha/intro/) which is required by the form-submit plugin in order to protect against spam submissions from bots. But fear not, unlike 1st generation CAPTCHA implementations, with their loathed cryptic text imagery, the most recent incarnation from Google is far less invasive. In fact, with the new [invisible option](https://www.google.com/recaptcha/intro/invisible.html), most users won't actually know there is a CAPTCHA present. For brevity, we'll leave out the reCAPTCHA implementation details here, but it is covered in the [form-submit plugin docs](/docs/plugins/form-submit/).

## Configure the plugin

Plugins are configured in the `aerobatic.yml` manifest. Here we want to mount the plugin at the `/contact-us` path and set it to only be enabled for requests using the `post` method. We are using an environment variable to store the actual Zapier webhook URL (we'll get the value shortly). Note that the `path` property matches the `target` attribute of the `<form>` element in the HTML.

~~~yaml
plugins:
  - name: form-submit
    path: /contact-us
    method: post
    options:
      formName: contact-us
      redirectUrl: /thank-you
      recaptchaSecret: $RECAPTCHA_SECRET_KEY
      targets:
        - name: webhook
          url: $ZAP_GSHEET_WEBHOOK_URL
---
~~~

## Create Zapier integration

Now let's configure the integration in Zapier. First you need a Zapier account &mdash; there's a free plan that allows up to 5 "zaps". While the steps below may initially seem daunting, the Zapier UI is quite slick and intuitive.

1. Login and click "Make a Zap!"
2. For the Trigger App, scroll down to the built-in apps section and select "Webhooks"
3. Select the "Catch Hook" radio option, then click "Continue"
4. On the "Pick a child key", leave the box blank and click "Continue"
5. On the next screen Zapier will provide you the webhook URL. Copy it to your clipboard and run the following command at the root of your Aerobatic website: `aero env -n ZAP_GSHEET_WEBHOOK_URL -v <PASTE_HERE>`. 
6. In order to complete the testing of the webhook, we need to send Zapier an actual form submission from the website. If you haven't yet, go ahead and deploy your site with the `aero deploy` command.
7. Now submit the form with some test data. Back in the original Zapier browser tab, the test should indicate a success.
8. On the next screen, we need to set the "Action App" where form submissions will be sent. In this case that will be "Google Sheets".
9. On the next screen, leave the default action as "Create Spreadsheet Row".
10. Next connect your Google account to Zapier.
11. In the same Google account, create a new Google spreadsheet and save it with a name of your choosing. Add the column headers in the first row which shouldcorrespond to the `name` attributes of your HTML input elements. The names don't have to match exactly since Zapier will let us establish mappings. For this example the column headers will be: **name**, **email**, and **message**. You should also create columns for the additional metadata fields **submitted at**, **ip address**, and **location**. 
12. Back in Zapier, use the dropdowns to select the new Google spreadsheet and the worksheet within the spreadsheet to append to. Once selected you will have the opportunity to bind the column headers to the appropriate field received in the test form submission (see **Figure #1** below).
13. Proceed to the final verification screen and everything should be wired up. The last step is to name your Zap and turn it to the "ON" state.

## See it in action

Go ahead and submit another test form and you should see it get added to the spreadsheet. Since Google docs auto-update when changes are made by other users (or API calls in this case), you can even leave the sheet up and see new submissions appear in near real-time!

Here's a screencast showing the [form-submit-demo](https://form-submit-demo.aerobaticapp.com) (which uses the same exact setup as we just walked through) in action:

{{< youtube 67ZL7pJ52bM >}}

{{< img src="https://www.aerobatic.com/media/blog/zapier-google-sheets-screenshot1.png" title="Figure 1: Zapier Gooogle Sheets Row Setup" >}}

## Conclusion

That's it &mdash; now each time a user submits the contact form on your Aerobatic hosted website it will show up as a new row in the spreadsheet within seconds. No wrangling with APIs and no server code or infrastructure to maintain. The process for setting up a Zapier webhook integration for other services is very similar to this one.

You're not limited to simple contact forms either, this same technique can be applied to a complicated multi-step user survey. Just code it with client JavaScript and POST it to the configured plugin route at the end.

Now there's one less reason to hold onto that PHP or other active server backend. Static sites FTW! 









