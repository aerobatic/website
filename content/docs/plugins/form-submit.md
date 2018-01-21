---
title: Form submit plugin
plugin: true
name: form-submit
---

# Form submit plugin

The `form-submit` plugin let's you submit HTML forms from your Aerobatic static website. Form submissions are saved in a database on the Aerobatic side that you can view in the dashboard. It's a great solution for contact forms, quote requests, email list subscribes, user surveys, and the like.

You can optionally specify that form submissions be emailed or posted to a webhook enabling more sophisticated integrations with other services. The webhook feature is especially powerful when used in conjunction with [Zapier](https://zapier.com) which can combine an incoming webhook with lots of popular services like Mailchimp, Salesforce, and many more.

See the [form-submit-demo](https://github.com/aerobatic/form-submit-demo) to see the plugin in action.

## Usage

```yaml
plugins:
  - name: form-submit
    path: /contact-us
    method: post
    options:
      formName: contact-us
      redirectUrl: /thank-you
      recaptchaSecret: $RECAPTCHA_SECRET_KEY
      targets:
        - name: email
          subject: Demo contact-form submission
          recipients: [your-email@email.com]
        - name: webhook
          url: $ZAP_GSHEET_WEBHOOK_URL
---
```

Your code just has to declare a standard HTML form with a `target` attribute that matches the `path` in the plugin declaration (also be sure to set `method` to "post"). The form submission is stored as a JSON object where the keys are the values of the `name` attributes on the input elements.

```html
<form target="/contact-us" method="post">
  <label for="name">Name</label>
  <input type="text" required name="name">

  <label for="email">Email</label>
  <input type="email" required name="email">

  <label for="message">
  <textarea name="message"></textarea>
</form>
```

### reCAPTCHA

A Google reCAPTCHA is required on all forms. This is to prevent spam from bot submissions. The latest version of reCAPTCHA has an "invisible mode" where most users will never even have to interact with the captcha.

{{% alert tip %}}
Under certain conditions, such as when the user has made several submissions in a relatively short period of time, Google will challenge the user before the form can be submitted. This challenge is a "visual quiz" where the user is presented with a grid of images and they have to click each one that has a street sign or a storefront..
{{% /alert %}}

Follow the steps below to create your own reCAPTCHA for each form:

1. Visit [https://www.google.com/recaptcha/admin](https://www.google.com/recaptcha/admin).
2. In the **Register a new site** section, enter a Label such as "Contact Form". For the **Type** setting, we recommend the "Invisible reCAPTCHA" which validates most users in the background without affecting your form visually in any way.
3. In the **Domains** box, enter `aerobaticapp.com` on the first line. Or if you are on the Pro Plan and have a custom domain, enter that domain instead. Just enter the root domain, i.e. `domain.com`, rather than `www.domain.com`. You can always come back and edit this after you've upgraded.
4. Agree to the terms of service and click **Register**.
5. On the next screen you will be provided your **Site key** and **Secret key**. The site key will be embedded into your HTML code. The secret key is used by the Aerobatic server to validate the reCAPTCHA directly with Google.

To set the **Secret key** as an environment variable, run the following command. The variable can of course be named whatever makes sense for your scenario.

```sh
aero env --name CONTACT_FORM_RECAPTCHA_KEY --value <YOUR_SECRET_KEY>
```

**Including reCAPTCHA in your webpage**

Now you need some code to your HTML page to wire up the reCAPTCHA. The [Google developer docs](https://developers.google.com/recaptcha/docs/invisible) describes several different ways for doing so. The number of choices makes it a bit daunting and the sequence of browser events can be tricky to get right. Through trial and error we've arrived at the following pattern that works well and plays nicely with client side form validation &mdash; either your own custom JavaScript validation, or built-in HTML5 validation.

The [form-submit-demo](https://github.com/aerobatic/form-submit-demo) is a fully working example that demonstrates this pattern.

```html
<body>
  <form id="demoForm" method="POST" action="/contact-us">
    <!-- Form fields here -->
    <button type="submit">Submit</button>
    <div class="g-recaptcha"
      data-sitekey="YOUR_SITE_KEY_HERE"
      data-callback="recaptchaOnSubmit"
      data-size="invisible">
    </div>
  </form>
  <!-- The script can go at the end of your body tag -->
  <script>
    function onSubmitForm(event) {
      // Allow for client validation to happen before the recaptcha
      // Here we are just using HTML5 built-in form validation
      grecaptcha.execute();

      // Important to prevent the form from submitting on it's own
      event.preventDefault();
    }

    function recaptchaOnSubmit(token) {
      // Now submit the form
      // Or instead of the line below, you can post the form using fetch or XHR.
      document.getElementById('demoForm').submit();
    }

    document.getElementById('demoForm').addEventListener('submit', onSubmitForm);
  </script>
  <script src="https://www.google.com/recaptcha/api.js" async defer></script>
</body>
```

{{% alert warning %}}
The function provided to the `data-callback` attribute of the reCAPTCHA div (in this case `recaptchaOnSubmit`) **must** be a global function!
{{% /alert %}}

## Using AJAX

In the simple plugin model, the full webpage is posted to Aerobatic. After the POST body is collected, the browser is redirected to the `redirectUrl`. However you can also submit the form with AJAX. Just make sure that the `Accept` header is set to `application/json`. JQuery offers a convenient `dataType` property for doing this:

```js
$.ajax({
  url: demoForm.attr("action"),
  method: "POST",
  data: demoForm.serialize(),
  // This causes Accepts header to be application/json
  dataType: "json",
  success: function() {
    // Replace the form with a thank you message
    demoForm.hide();
    $("#thankYou").show();
  }
});
```

In the example above the [JQuery serialize](https://api.jquery.com/serialize/) function is used to create a JSON object from all the form inputs which will automatically pick up the hidden input injected by the Google reCAPTCHA. If you are constructing the JSON object yourself, then you'll need to make sure you append the input with id `g-recaptcha-response` to the object.

```js
$.ajax({
  url: demoForm.attr("action"),
  method: "POST",
  data: {
    email: $("#email").val(),
    message: $("#message").val(),
    "g-recaptcha-response": $("#g-recaptcha-response").val()
  },
  // This causes Accepts header to be application/json
  dataType: "json",
  success: function() {
    // Replace the form with a thank you message
    demoForm.hide();
    $("#thankYou").show();
  }
});
```

## Viewing submissions

Form submissions can be viewed in the Aerobatic dashboard. The labels on the left are derived by title-casing the values of the `name` attributes in your HTML form. Several `X-` metadata fields are appended to the submission including the date and time when the form was submitted, the configured `formName`, the anonymized IP address of the end user that submitted the form, and an approximate geo-location of the user.

![Form Submission screenshot](https://www.aerobatic.com/media/docs/--3/form-submission-dashboard.png)

In addition to viewing form submissions in the Aerobatic dashboard, you can also specify two additional targets: "email" and "webhook".

### Email

The email target sends the same exact information that can be viewed in the dashboard to one or more email addresses. To enable, just declare and entry in the `targets` array of the plugin declaration:

```yaml
targets:
  - name: email
    subject: Demo contact-form submission
    recipients: [your-email@email.com]
---
```

Because you control the subject, you can take advantage of advanced filtering and rule capabilities in your email client. Did you know you can create a rule in Gmail to forward all messages that match a filter criteria to a phone via SMS? Turns out [you can](https://www.howtogeek.com/210956/how-to-configure-automatic-text-message-alerts-for-important-emails/).

### Webhooks

For even more flexibility we offer the `webhook` target. This will POST the form submission data (including the additional metadata) as a JSON object to a specified URL. These webhooks can be endpoints you control, or ones provided by 3rd party services. Just declare an entry in the `targets` array with the webhook URL (which can be set as an [environment variable](/docs/configuration/#environment-variables)):

```yaml
targets:
  - name: webhook
    url: $ZAP_GSHEET_WEBHOOK_URL
---
```

If the service you want to send form submissions to doesn't provide a webhook endpoint, check out [Zapier](https://zapier.com). It's a SaaS integrator that can expose a webhook endpoint as a bridge to tons of other services including:

* [Google Sheets](https://zapier.com/zapbook/zaps/1035/add-data-to-a-spreadsheet-from-a-webhook/)
* [Mailchimp](https://zapier.com/zapbook/zaps/1431/add-mailchimp-list-subscribers-from-a-webhook/)
* [Twilio](https://zapier.com/zapbook/zaps/1690/send-webhook-as-an-sms-message-with-twilio/)
* [Hubspot](https://zapier.com/zapbook/zaps/10642/make-hubspot-form-submissions-from-webhooks/)
* [Salesforce](https://zapier.com/zapbook/zaps/1751/add-a-new-salesforce-lead-from-a-webhook/)
* And [many more](https://zapier.com/zapbook/webhook/)

See our [blog post](/blog/form-submit-zapier-google-spreadsheet/) demonstrating how to append each form submission to a Google spreadsheet using Zapier.
