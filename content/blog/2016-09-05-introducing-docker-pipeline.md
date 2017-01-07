---
title:  Introducing our new Docker powered build pipeline
description: We've switched our CI/CD pipeline from AWS Lambda to Docker and think you'll like it much better.
slug: introducing-docker-pipeline
comments: true
date: 2016-09-05
tags: build, cd, pipeline, docker
---

<div style="text-align: center; margin-bottom: 20px;">
<img src="//www.aerobatic.com/media/logos/docker-logo.png" style=" max-width: 100%; max-height: 100px;">
</div>

We've just completed rolling out our new Docker powered build and deployment pipeline. The new pipeline configuration is backwards compatible with our previous AWS Lambda based pipeline. You simply specify a `build` section in your [package.json manifest](/docs/configuration#website-manifest) specifying one of our supported build engines: [jekyll](/docs/automated-builds#jekyll), [hugo](/docs/automated-builds#hugo), [middleman](/docs/automated-builds#middleman), [npm](/docs/automated-builds#npm), or [bash](/docs/automated-builds#bash).

~~~json
{
  "_aerobatic": {
    "build": {
      "engine": "[engine_name]"
    }
  }
}
~~~

More details are available on our [automated builds documentation](/docs/automated-builds).

## Improvements

While our original pipeline running on AWS Lambda worked well for simple use cases, it was showing cracks when it came to more complex builds such Jekyll sites relying on plugins with native gem dependencies and npm builds with a large set of dependencies. Mostly these shortcomings are a side-effect of the lack of control over the container image that Lambda functions execute within. Now each build is executed in a dedicated Docker container where we have full control over the software stack. Our ready-made images have Ruby, Python, Node, and several of the static-site generators all pre-installed. Additionally all the low-level apt-get packages needed for compiling native libraries are present.

The net result is more reliable builds and much greater flexibility to accommodate most any type of static site generation.

### `bash` build engine

For the utmost flexibility we are now providing a `bash` build engine that lets you provide a `.sh` script where you can do just about anything you want. Just specify the `output` directory and whatever ends up there after your shell script is done executing is what will be deployed.

Many common executables are already present in the `PATH` such as: `ruby`, `python`, `node`, `pip`, `bundler`, `npm`, `make`, and `git`.

~~~json
{
  "_aerobatic": {
    "build": {
      "engine": "bash",
      "script": "build.sh",
      "output": "output"
    }
  }
}
~~~

The `bash` build engine is a great way to run static site generators that we don't currently have a dedicated build engine for. For example a `build.sh` script to build a [Pelican](http://blog.getpelican.com/) site could be written as:

~~~sh
# Alternately you could include a requirements.txt in your repo and run
# pip install -r requirements.txt
pip install pelican markdown
pelican content
~~~

If your script returns a non-zero exit code, that will signal the pipeline that the build should be marked as a failure.

### Bundler support

Previously Jekyll plugins could only be listed in the `config.yml` file. Now that [Bundler](http://bundler.io/) is pre-installed on the Docker image, the recommended approach is to commit a `Gemfile` to your repo. Both the `jekyll` and `middleman` build engines will automatically run `bundle install` if a `Gemfile` is detected. If you want to ensure specific versions of all your gems, then you should also commit the `Gemfile.lock` to your repo. This will cause bundler to run in [deployment mode](http://bundler.io/v1.12/man/bundle-install.1.html#DEPLOYMENT-MODE).

Because the underlying image has the ruby developer libraries installed, you can now install gems that depend on native extensions such as [nokogiri](https://rubygems.org/gems/nokogiri), [json](https://rubygems.org/gems/json), and [sassc](https://rubygems.org/gems/sassc) no problem.

### Environment variables

You can now utilize environment variables in your build scripts. These are the same environment variables that [you already manage](/docs/configuration#environment-variables) in the Bitbucket add-on. Simply include an `env` array in the build config with the variables that should be available to your scripts.

One common example is storing API keys that the build process needs to connect to a remote service such as [Contentful](https://www.contentful.com/).

~~~json
{
  "_aerobatic": {
    "build": {
      "env": ["CONTENTFUL_ACCESS_TOKEN"]
    }
  }
}
~~~

Then in build scripts, simply access the variable with standard environment variable accessor syntax:

| Language      | Syntax                 |
| ------------- | ---------------------- |
| node          | `process.env.VAR_NAME` |
| bash          | `$VAR_NAME`            |
| ruby          | `ENV['VAR_NAME']`      |
| python        | `os.environ['VAR_NAME']` |

## Underlying technology

Behind the scenes we are using [AWS ECS](https://aws.amazon.com/ecs/) as our Docker container manager. We actually still utilize a Lambda function to schedule the build with ECS whenever the status of a version enters the new "Queued" status (shown in yellow background in the Aerobatic Bitbucket console). This is the first stage of the pipeline of your deployment - when the webhook has been received from Bitbucket but a Docker container has not yet been provisioned to carry out the build.

Here's the high-level complete pipeline flow:

1. Upon receiving push webhook from Bitbucket, new version created in the database with status of "Queued".
2. The latest source tarball is downloaded from Bitbucket and staged on S3.
3. Lambda function is triggered by DynamoDB stream that assembles the build parameters and invokes the ECS [RunTask](http://docs.aws.amazon.com/AmazonECS/latest/APIReference/API_RunTask.html) operation.
4. Within the ECS Docker container, the latest version of the Aerobatic pipeline application is downloaded and the version status is updated to "Running".
5. The pipeline app downloads and decompresses the staged source tarball.
6. Build scripts specified by the website build configuration are executed at the root of the repo.
7. The contents of the output directory are deployed to S3 in all AWS regions where Aerobatic operates origin servers.
8. Database is updated to point live traffic to the newly deployed version.

## Open for business

The new pipeline is now handling all the builds and deployments on Aerobatic. Even if you don't specify a build config, the same workflow is carried out by the `basic` build engine, which simply deploys exactly what is in the repo. Please [let us know](mailto:support@aerobatic.com) if you have any special build needs that we haven't accommodated for. Our goal is to be your one stop shop for continuous build, deployment, and hosting for all your static sites.
