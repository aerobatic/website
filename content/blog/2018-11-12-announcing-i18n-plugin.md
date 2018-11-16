---
title: Announcing the i18n plugin
slug: announcing-i18n-plugin
date: 2018-11-11
description: The i18n plugin let's you automatically route visitors to a locale specific URL based on their language or country.
---

<div style="text-align: center; margin-bottom: 30px;">
<img src="https://www.aerobatic.com/media/blog/translate-languages.png" width="500" />
</div>

We're excited to announce our latest [i18n plugin](/docs/plugins/i18n/) that allows you to provide a better experience for your website visitors that are coming from different countries and different language preferences. It works by automatically redirecting to an alternative URL based on their browser language and/or the country they are coming from.

For example, if a browser hits your site with the `Accept-Language` header set to Spanish, you can send them directly to `https://mysite.com/es` rather than showing them the default version. This can also be done based on their country which is determined by their IP address. So for example you could elect to redirect all visitors from the United Kingdom to `https://mysite.com/uk`. This works on the home page as well as deep-links to nested pages.

The plugin also makes it easy for you to implement a locale picker widget allowing your users to explicitly set their desired language.

See the [plugin docs](/docs/plugins/i18n/) for complete details on how to configure - as with all Aerobatic plugins, its just a few lines in your `aerobatic.yml` file. It's specifically designed to work in conjunction with the i18n capabilities of static site generators including [Jekyll, Hugo, Gatsby, and others](/docs/plugins/i18n/#static-site-generators). In fact we've put together a [Jekyll demo site](https://i18n-demo.aerobaticapp.com) [[source code](https://github.com/aerobatic/i18n-demo)] that showcases how the plugin works.

If you have translated or somehow alternative content that you'd like to intelligently display to your website visitors based on their native language or country of origin, Aerobatic has you covered.
