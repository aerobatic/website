---
title: How to Post a Jekyll Contact Form To Slack
subtitle: No more PHP
comments: true
date: 2015-09-13
slug: post-a-jekyll-contact-form-to-slack
description: Use a Slack inbound webhook and the Aerobatic API proxy to post a Jekyll form instead of PHP.
tags:
---

At Aerobatic, we're big fans of [Jekyll](http://jekyllrb.com/) for its elegant simplicity as a blog templating solution. One of the things that's also nice about Jekyll are the many themes that are available, especially on [http://jekyllthemes.org/](http://jekyllthemes.org/).

However, while Jekyll is great for outputting content in its `_site` folder that can be hosted on any static hosting solution like Aerobatic, the contact forms that come with many Jekyll themes are usually written with php and require some server-side hosting.

Take the otherwise awesome [Agency](http://jekyllthemes.org/themes/agency/) theme, for example. It's got a beautiful-looking contact form but requires a simple php script so the form content can be posted to an email address. What if instead of emailing the form content, we instead post them to a Slack channel using an [incoming webhook](https://api.slack.com/incoming-webhooks)? Doing this, we get rid of any need to host our php server-side code somewhere and can replace it with a simple API call. Now we've got a fully static site again, and some nicely formatted form content flowing into Slack.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/contact-slack/slack-message.png" />

The rest of this post walks you through how to do just that using the Aerobatic [http-proxy](/docs/plugins/http-proxy/).

## Step 1: Set up a Slack incoming webhook

Slack has a really nice flow to walk you through setting up a [new incoming webhook](https://api.slack.com/incoming-webhooks). Once you've done that, you'll have a webhook URL that looks something like this:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/contact-slack/webhook-url.png">

## Step 2: Set up the http-proxy

Many times, an API we're calling is not CORS enabled. In the case of Slack, it is. However, we likely also don't want to have our webhook URL in our client code in plain view for everyone to see. That's where the express-request-proxy comes in.

So, go ahead and create a `package.json` file in the root of your Jekyll repo add the following code block:

```yaml
plugins:
  - name: http-proxy
    path: /slack
    method: post
    options:
      url: $SLACK_WEBHOOK
  - name: webpage
---
```

You'll notice that in the url option, we've got an environment variable called `SLACK_WEBHOOK`. Next, we'll set that environment variable in Bitbucket.

## Step 3: Set up an environment variable

We'll assume you're already familiar with how to host a Jekyll site on Aerobatic. If you haven't already done so, go ahead and do so. This [page](/docs/static-site-generators/#jekyll) describes how to set up a Jekyll site on Aerobatic.

Once your site is hosted, you're then ready to create that environment variable. The URL will be the same as the one you got when you set up the Slack incoming webhook. The `aero env` command is used to set the value:

{{< cli "aero env --name SLACK_WEBHOOK --value https://hooks.slack.com/services/xxx" >}}

## Step 4: Modify contact_me.js

In the `/js` folder of your Jekyll site, there is a file called `contact_me.js` This file processes the form contents and makes an AJAX Post request to `/mail/contact_me.php`. We're going to simplify that.

Find the section that contains the following code:

```js
// get values from FORM
var name = $("input#name").val();
var email = $("input#email").val();
var phone = $("input#phone").val();
var message = $("textarea#message").val();
var firstName = name; // For Success/Failure Message
// Check for white space in name for Success/Fail message
if (firstName.indexOf(' ') >= 0) {
    firstName = name.split(' ').slice(0, -1).join(' ');
}
$.ajax({
    url: "././mail/contact_me.php",
    type: "POST",
    data: {
        name: name,
        phone: phone,
        email: email,
        message: message
    },
```

Replace it with the following:

```js
// get values from FORM
var name = $("input#name").val();
var email = $("input#email").val();
var phone = $("input#phone").val();
var message = $("textarea#message").val();

//slack options
var formData = '*Name:* ' + name + '\n *Email:* <mailto:' + email + '|' + email + '> \n *Phone:* ' + phone + '\n *Message:* ' + message;

var firstName = name; // For Success/Failure Message
// Check for white space in name for Success/Fail message
if (firstName.indexOf(' ') >= 0) {
    firstName = name.split(' ').slice(0, -1).join(' ');
}
$.ajax({
    url: "/slack",
    type: "POST",
    data: JSON.stringify({
        text: formData,
        username: name,
        channel: "#support",
        icon_emoji: ":crying_cat_face:"
    }),
    dataType: "text",
```

## Step 5: No Mo php

Push your code and your Jekyll site should now have a contact form that submits to your Slack channel! If you want something other than the crying cat face emoji, Slack has lots of [emojis to choose from](http://www.emoji-cheat-sheet.com/).

If you're feeling especially liberated, go ahead and delete that pesky php file and sing from the rooftops that you're proud to be static!
