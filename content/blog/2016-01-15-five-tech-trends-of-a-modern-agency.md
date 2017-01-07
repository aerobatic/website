---
title: Five Tech Trends of a Modern Digital Agency
description: How progressive digital agencies are changing their technology approach to working with clients
slug: five-tech-trends-of-a-modern-agency
comments: true
date: 2016-01-14
tags: agencies, static sites, git, continuous delivery
---

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/agency/agency.png">

Over the past couple of years, we've had the opportunity to work with many digital agencies - some operating globally with major Fortune 50 clients, with others being one or two person firms working with clients locally, and many in between those extremes.

Big or small, the thing those agencies have in common is that they are looking for an edge - an easy way to manage and deploy client sites, an opportunity to save money, a way to remove friction from their processes, a way to level up the service they provide to their clients.

From a technology point of view, there are five key trends they've all embraced to operate as a modern agency. If you're a client looking for an agency, theses are areas of focus you'll want to evaluate a prospective agency on. If you're a modern agency, these are the practices you've already adopted to help your clients be successful:

**Five Tech Trends**

1. Shift from dynamic to static
2. git version control
3. Continuous delivery
4. Integrated teams
5. No Ops

### Shift from Dynamic to Static

Historically, agencies have relied on various Content Management Systems (CMS) to build client sites. For small agencies, Wordpress is obviously the most prevalent, and is estimated to [run 25% of all sites](http://w3techs.com/technologies/overview/content_management/all) on the Internet. For large enterprise clients, common legacy CMS tools include [SiteCore](http://www.sitecore.net/), [Adobe Experience Manager](http://www.adobe.com/marketing-cloud/enterprise-content-management/web-cms.html), [LifeRay](https://www.liferay.com/), [Oracle Webcenter Content](https://www.oracle.com/middleware/webcenter/content/index.html), and many others.

The main purported pro for a CMS in an agency setting is that non-technical clients can update websites themselves. However, in our conversations with agencies, it's more often the case that the clients simply call the agency and has them do that for them. Or, the sites are built around time-bound marketing campaigns where they never need to edit them. In other words, these customers are paying thousands of dollars (or more) for a complex piece of CMS software they don't actually use. Beyond that, there are of course, the usual cons of a CMS concerning security vulnerabilities and poor performance.

Modern agencies on the other hand, have embraced static generators such as [Hugo](http://gohugo.io/) or [Jekyll](https://jekyllrb.com/), or they're building modern JavaScript Single Page Apps (SPAs) to deliver amazing digital experiences without all the baggage of a CMS. Digital agencies that use Aerobatic have taken a no-CMS approach to save the client money, deliver better website performance, reduce security risks, and eliminate unnnecessary complexity.

**Key client questions to ask an agency:**

-  Have you worked with [Static Generators](http://www.staticgen.com/)? If so, which do you recommend? Why?
-  How do you optimize website performance?
-  How do you mitigate security vulnerabilities?
-  How do you plan for scaling a website if it generates a lot of unanticipated traffic?

### git version control

In today's world of distributed development teams, version control is a must. Whether it's [Bitbucket](https://bitbucket.org/), [Github](https://github.com/), or [Gitlab](https://about.gitlab.com/), modern agencies are using cloud-based git version control systems to manage their code. Gone are the days of emailing zip files, sharing Dropbox folders, or FTPing files around the Internet. Even agencies that were hosting their own git version control instance on a server somewhere under someone's desk are dropping that approach in favor of moving fully to the cloud.

With git version control, modern agencies have set up a common workflow with distinct feature branches which are then merged into a consolidated staging branch, and finally, a master production branch. In fact, some of our more sophisticated agencies actually have the client [manually push](/docs/deployment-management) the site into production via the Bitbucket UI.

If you're an agency and you want to get started with git version control, check out this [git tutorial](https://www.atlassian.com/git/tutorials/) from Atlassian. You can also [learn how](/blog/managing-cd-releases-staging-production) we enable agencies to successfully adopt dev - staging - production workflows.

**Key client questions to ask an agency:**

- What's your approach to code version control?
- How do you ensure security of the version control system (if the agency is hosting it themselves)?
- Can I, as the client, have access to the code repository during the development cycle?

### Continuous Delivery

Git version control is a pre-requisite for building modern digital experiences. The next step then is Continuous Delivery. That is, whenever new code is committed to the repository, a new version of the site is deployed immediately. Modern agencies that have adopted this flow are able to create a nice feedback loop of develop - deploy - analyze and ultimately optimize the client's site for engagement or conversion goals.

This sort of approach also lends itself well to agile development where the client can provide feedback early and often during the development cycle, instead of waiting for a single hand-off at the end of the development cycle.

**Key client questions to ask an agency:**

- Do you practice Continuous Deployment?
- How do you optimize a website for [YOUR KEY METRIC]? What does that feedback loop look like?
- How do you roll back a site to an earlier version?

### Integrated Teams

We've touched on this in the other trends, but it deserves its own special mention. Modern agencies don't keep clients at arms length once the brief has been agreed upon. Rather, they create a blended team where the client, whether they're technical or not, has full visibility into the development cycle, and is providing feedback at regular intervals.

For example, modern agencies that practice continuous deployment provide client access to a [password protected](/docs/http-basic-authentication) staging environment that the client can review periodically, and that staging environment is a true reflection of how the site will perform in production i.e. the site is served from a global CDN and not some staging server under someone's desk.

**Key client questions to ask an agency:**

- How will I, as the client, be involved in providing feedback during the development cycle?

### NoOps

Modern agencies are opinionated about deployment. They've taken the steps to run a lean and agile development process, and they're laser-focused on cutting out fat from the process. In enterprises, the buzzword of the past few years has been DevOps. Modern agencies embrace a culture of NoOps. That is, they've made a conscious decision to not concern themselves with servers and non value-adding sys admin work. Instead, they are using the latest serverless approaches to get their work done. Services like Aerobatic make Continuous Deployment possible and affordable for all agencies, large and small. Legacy agencies make it the client's problem - here is the zip file, my work is done. Modern agencies provide a full end-to-end service, including world-class hosting that's backed by a global CDN, and set up with [HTTPS](/docs/ssl) to ensure favorable treatment by search engines.

**Key client questions to ask an agency:**

- What do you recommend for hosting the website?
- How much time will you spend (and bill me) on setting up hosting?
- Describe your support process and SLAs for uptime?
- Will my site be served from a global CDN?
- Will my site be HTTPS-enabled?

### Summary

Most of the *modern* agencies we work with tend to be on the smaller side - they run lean, they're hungry, and they're innovative. Technology is a key part of their value proposition. On the other hand, some larger agencies have a tried and tested approach to how they work with clients, and they don't want to rock the boat. Even there though, we've witnessed some of the more progressive and curious developers take the leap and start experimenting with the 5 key technology trends outlined above.

In all cases, Aerobatic is a powerful and simple way to [get started](/docs/getting-started) with continuous delivery and world-class static website hosting. Ready to get hip?

<iframe src="//giphy.com/embed/n4y3lJQ3XZz2g" width="480" height="269" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href="https://giphy.com/gifs/comedy-bang-n4y3lJQ3XZz2g"></a></p>
