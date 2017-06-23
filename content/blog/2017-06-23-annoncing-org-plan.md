---
title: Announcing the new Organization pricing plan
description: Our new Org plan is perfect for digital agencies and companies that create a lot of websites
date: 2017-06-23
slug: announcing-organization-pricing-plan
---

Today we are announcing a new Organization pricing plan that provides a pool of 50 websites for $150 / month. Every site is accessed via a sub-domain of your account's designated custom root domain. For example if your org domain is `superdomain.com` then your websites are accessed with URLs like `https://site1.superdomain.com`, `https://site2.superdomain.com`, and so forth. Pricing is $150 a month with additional blocks of 10 websites for $50 / month. Once your domain is setup anyone on your team can have a new website up and running on our global delivery network in less than 30 seconds.

### Perfect for agencies
The Org plan is an ideal "white label" solution for digital agencies developing sites for clients. Many of our customers are looking for a fully-managed hosting solution for sharing ongoing work with their client prior to the actual launch. Using our Org plan every client engagement gets their own sub-domain nested beneath the agency's main domain name. For example `https://client-xyz.superagency.com`. And of course you can utilize our [password-protect](/docs/plugins/password-protect/) plugin to ensure only the client is able to access the site.

### Innovation platform

Another ideal customer are companies and organizations with many developers that would benefit from a completely seamless workflow for launching demos, proofs of concepts, website experiments, landing pages, and so forth. With Aerobatic, there's no IT gatekeepers, no deployment scripts to wire up, no infrastructure wrangling. Developers have total freedom to take an idea, build a prototype, and immediately deploy to a globally distributed CDN. They'll have an organization branded URL to share with co-workers, business partners, etc. When infrastructure and red tape barriers are eliminated, orgs are able to iterate faster, conduct more experiments, and foster a culture of innovation. With today's wealth of tools and browser technologies paired with serverless backends and [Aerobatic plugins](/docs/plugins/), there's virtually no limit to what can be achieved with [JAMStack](https://jamstack.org) sites running on Aerobatic. 

### DNS Setup

Once your domain is setup with Aerobatic you would just create a wildcard CNAME with your DNS provider. That way no further DNS changes are required as new websites are deployed. Just set it once and your team can start deploying sites to your domain with zero operational overhead.

### Getting Started

Just send an email to [support@aerobatic.com](mailto:support@aerobatic.com?subject=Org+Plan+setup) to get started. We'll step you through getting your domain wildcard SSL certificate provisioned and DNS correctly configured. It's generally a straightforward process but there are some edge cases and we want to be available to promptly assist. After this one time initial setup your team is ready to start building and deploying.

Rolling Aerobatic out to your organization goes like this:

1. Org administrator invites developers to the Aerobatic team account in the dashboard
2. Developers install the CLI to their machines: `npm install -g aerobatic-cli`
3. Developers login via the CLI: `aero login`
4. Developers create new sites: `aero create --name first-poc`
5. Developer deploys their site: `aero deploy`
6. Site is now accessible at `https://first-poc.your-org-domain.com`
7. Repeat 4, 5, and 6












