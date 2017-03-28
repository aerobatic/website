---
title: Multi-site JavaScript apps using wildcard sub-domains
description: Aerobatic supports a wildcard sub-domain that will resolve all sub-domains to the same website allowing for some interesting JavaScript app options.
date: 2017-03-28
tags: sub-domain, javascript, spa, wildcard
slug: multi-site-javascript-app-wildcard-subdomain
---

When you bind your Aerobatic website to a custom domain (Pro Plan required), you can enter an asterisk in the sub-domain field. This acts as a wildcard meaning that any sub-domain will resolve to the same physical website.

For a standard static HTML content site, this is generally frowned upon as it introduces duplicate content for search engines. However it opens up some interesting possibilities for JavaScript apps that dynamically generate the page on the ***client***.

Imagine an HTML5 gaming site at the fictional domain **aerogames.play**. This technique would allow each game to run on a different sub-domain such as:

* `https://tictactoe.aerogames.play`
* `https://chess.aerogames.play`
* `https://poker.aerogames.play`

From the static web serving perspective, each of these URLs is the exact same code &mdash; probably just a minimal HTML shim and a JavaScript bundle. The client script is responsible for examining the `window.location.hostname` and loading the correct game into the DOM. Even though it renders to the end user as distinct experiences, it's all the same physical site, so you only pay for a single Aerobatic subscription.

This even works in conjunction with [deploy stages](/docs/overview/#deploy-stages), so you could deploy to the **preview** stage and have your JavaScript app available at each of these URLs:

* `https://tictactoe--preview.aerogames.play`
* `https://chess--preview.aerogames.play`
* `https://poker--preview.aerogames.play`

And all of this is powered off a single website. Pretty cool, right? 😁
