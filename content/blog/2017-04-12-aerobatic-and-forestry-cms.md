---
title: Powering a Website Publishing workflow with Forestry CMS and Aerobatic
description: Forestry.io is a CMS designed for managing content for Jekyll and Hugo sites. Here we demonstrate how to continuously deploy content updates to Aerobatic.
date: 2017-04-12
tags: cms, forestry, github, cd, deploy
slug: forestry-aerobatic-publishing-workflow
---

At Aerobatic we are big proponents of treating content (markdown, images, etc.) with the same special care and feeding that we demand for our source code. Namely that it lives in Git where it benefits from all the great stuff we developers have come to rely upon &mdash; branching, pull requests, history, auditability, forks, and so on, not to mention peace of mind. For someone that spends their days with a code editor and terminal window open the process of editing markdown files and committing to git is a totally natural workflow.

But for the majority of marketers, technical writers, editors, and other content contributors, giving up a WordPress style admin interface for a plain text editor is often a non-starter. The lack of a smooth editing experience for non-developers has been the biggest impediment for wider spread adoption of static site generators as a replacement to traditional CMSes such as WordPress.

Fortunately a new breed of CMS tools are emerging that bridge the gap &mdash; providing a friendly interface for content editors but utilizing Git as the underlying storage repository rather than a proprietary database. As we'll see, this enables a universal deployment pipeline where changes from developers and changes from content contributors follow the same flow to production.

<div style="text-align:center;"><img src="/img/static-cms-gitflow.png" alt="Static CMS Gitflow" style="width:650px; max-width:100%;" /></div>

In this blog post we'll walk through how to accomplish this flow using [Forestry.io](https://forestry.io/) as the CMS, [Hugo](https://gohugo.io) as the static site generator, [GitHub](https://github.com), [AppVeyor](https://www.appveyor.com) for CI, and of course Aerobatic for hosting. You can easily substitute [Bitbucket](https://bitbucket.org) for GitHub and [most any CI provider](https://www.slant.co/topics/799/~best-continuous-integration-tools) for AppVeyor.

## Introduction to Forestry

[Forestry](https://forestry.io) is a CMS specifically designed for managing content for Jekyll and Hugo sites. It reads and writes directly from/to your GitHub or Bitbucket repository. It has built-in preview functionality that runs the specified static generator and provides a URL to the actual built site with the latest local changes. This is a great way to visualize how changes will look in the actual site before publishing to the underlying git repo. While Forestry can deploy directly to a hosting provider, we'd like all changes (both from developers and editors) to flow through the same CI build process, so we'll configure it to only publish to the repo.

## Let's Get Started

For this walkthrough we'll use a [demonstration repo](https://github.com/aerobatic/forestry-cms-demo) hosted on GitHub.

### Create Aerobatic website

1.  Fork the demo repo from https://github.com/aerobatic/forestry-cms-demo
2.  Clone the repo locally
3.  From the root of the repo, run `aero create`. The CLI will report back the URL for your website which you will need in the next section.

### Setting up Forestry

1.  Now login to Forestry.io (you can use your GitHub credentials if you like)
2.  Click the **Setup Site** button and select **Import Existing Site**
3.  In the **Generator** drop down, select "Hugo" and leave the **Version** as-is
4.  Now select **GitHub** as the repository provider and **Public Repos**
5.  In the **Choose Repository** screen select **your-github-user/forestry-cms-demo** and leave branch as **master**
6.  On the **Site Settings** screen set the name to something like **aerobatic-forestry-demo** and the Url to the value provided from the `aero create` command run in step 3 from the previous section. It should look something like `https://funny-name.aerobaticapp.com`.
7.  On the **Hosting Info** screen select **Commit to source repo only**
8.  Finally click **Save Changes**

Forestry is now linked to the GitHub repo. You can add and update pages, menus, and other content using their visual editing controls. If you click on the "Sample blog post" you'll notice a big green **Publish** button that will push a commit with the latest changes to the repository. In the next step we will configure the CI provider to build the changes and deploy to Aerobatic.

The **Preview** button below the **Publish** button will launch the rendered site in a new browser window so you can see exactly how the changes will look once live. There is also the ability to upload images. Finally the **View Site** button in the header will launch the live site URL that we configured in step 6 above.

![Forestry Screenshot](https://www.aerobatic.com/media/blog/forestry-hugo-screenshot.png)

See the [Forestry documentation](https://forestry.io/docs/) to learn more about how it works and what it is capable of.

### Setting up CI

The final piece of the puzzle is setting up a CI provider to automatically build and deploy the site whenever commits are pushed to GitHub. As mentioned earlier, for this demo we are using [AppVeyor](https://www.appveyor.com)(which is free for open-source projects), but you can use your favorite CI service just as easily.

The process for setting up any CI provider is roughly:

1.  Log into their dashboard
2.  Create a new CI project
3.  Bind it to the desired Git repo
4.  Add a build manifest to your repo, i.e. `appveyor.yml`, `.travis.yml`, etc.
5.  Create an environment variable named `AEROBATIC_API_KEY` whose value you can retrieve by running the `aero apikey` CLI command locally.

The demo repo already has an [appveyor.yml](https://github.com/aerobatic/forestry-cms-demo/blob/master/appveyor.yml) file that does the following:

* Download and install Hugo
* Run `npm install` to install the the [aerobatic-cli](https://www.npmjs.com/package/aerobatic-cli)
* Configure the `node_modules` directory to be cached to speed up subsequent builds
* Run `npm run deploy` to deploy the built site from the `public` directory (where Hugo write the output) to Aerobatic. The `deploy` script in `package.json` simply runs the `aero deploy` command, but we put it in an npm script in order to resolve to the `aero` command in the `node_modules` directory. The `deploy` command relies upon the `AEROBATIC_API_KEY` environment variable set in step 5 above.

### Testing it out

Now our end to end publishing toolchain is all in place. Go ahead and try updating the title or body of a blog post back in Forestry and click the **Publish** button. Visit the AppVeyor dashboard and within seconds you should see a new build triggered. The build page for the demo site is at [https://ci.appveyor.com/project/dvonlehman/forestry-cms-demo](https://ci.appveyor.com/project/dvonlehman/forestry-cms-demo). If the build completes with a green status, that means it's been successfully deployed to Aerobatic.

![AppVeyor build output screenshot](https://www.aerobatic.com/media/blog/appveyor-forestry-demo.png)

Now whenever a change is pushed to the repo, whether a stylesheet update by a developer, or a blog post update from a marketer, the same build pipeline is run to integrate the changes and deploy them live.

## Approval workflow with pull requests

This setup works great for small teams where everyone is allowed to deploy straight to production. But many teams want some controls in place where changes are first deployed to a test environment before being promoted to production. This is where [Aerobatic deploy stages](/docs/deployment/#deploy-stages) come into play.

Back in the Forestry setup, we selected the "master" branch. However a different branch such as "preview" could have been selected. Then in the CI build instructions, the "preview" branch would be configured to deploy to the preview stage rather than production. This is done by passing the `--stage` option to the CLI, i.e. `aero deploy -d public --stage preview`. The preview URL is a private instance where reviewers and other stakeholders can see and approve changes prior to going live to production. You can even utilize the [password-protect](/docs/plugins/password-protect/) plugin to require a password for the preview stage ensuring only authorized people can access it.

The process for promoting to production then becomes:

1.  Submit a pull request from preview branch to master
2.  Approver reviews and either requests changes or approves
3.  Pull request is merged to master
4.  A CI build is triggered that build and deploys the master branch to production

While pull requests are likely a new concept for most non-developers, the basic idea of an approval workflow is well understood. Admittedly this notion of marketers and content editors utilizing Git is not widely practiced yet, but hopefully as services like Forestry continue to evolve, they will provide friendly abstractions around things like pull requests that makes taking advantage of these powerful tools increasingly accessible to developers and non-developers alike.

## Conclusion

So that's our end to end publishing workflow. While there are a few moving parts involved, once setup the entire system works quite reliably. Both the code _and_ content happily reside together in the same repo and all changes, both those initiated by developers and content editors, flows through a common deployment (and approval) pipeline. If you're a developer and have been wanting to switch from a CMS to a static site generator, but have been holding off because the marketing folks demand a GUI interface, check out [Forestry.io](https://forestry.io) and see if you can say goodbye to WordPress once and for all.
