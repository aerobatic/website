---
title: Continuous Deployment
name: continuous-deployment
---

# Continuous Deployment

Deploying your website directly from your local terminal is a great way to get started with minimal friction. However as the deployment process matures and particularly if there's a team of contributors, it makes sense to move to a CD workflow where git commits automatically trigger a build and deployment of the website using a CI/CD service.

The [aerobatic-cli](/doc/cli) can easily be installed and run as part of a build script with any of the growing set of CI/CD tools and services such as: [Jenkins](https://jenkins.io/), [Travis](https://travis-ci.com/), [Bitbucket Pipelines](https://bitbucket.org/product/features/pipelines), [Wercker](http://www.wercker.com/), [Codeship](https://codeship.com), [CircleCI](https://circleci.com/), [AWS CodeBuild](https://aws.amazon.com/codebuild/), [and more](https://github.com/ligurio/Continuous-Integration-services/blob/master/continuous-integration-services-list.md).

All the examples below are based on a [Jekyll](https://jekyllrb.com/) site being built by Travis, but the basic concepts are all transferrable to other static site generators and CI/CD services.

Travis uses a `.travis.yml` file to specify the build and deploy steps. Here's where we specify how to run the jekyll build step. After the build step has completed successfully, `aerobatic-cli` is globally installed from `npm`. Finally the `aero deploy` command will deploy the built assets as a new version to Aerobatic. In this case we are deploying to the production stage. Further down in this article we'll talk about how to deploy to `test`, `staging` etc.

~~~yaml
language: ruby
env:
  global:
    - secure: <encrypted_env_vars> # See AEROBATIC_API_KEY below
    - TRAVIS_NODE_VERSION="6.9.5"
install:
  - rm -rf ~/.nvm && git clone https://github.com/creationix/nvm.git ~/.nvm
  - (cd ~/.nvm && git checkout `git describe --abbrev=0 --tags`)
  - source ~/.nvm/nvm.sh
  - nvm install $TRAVIS_NODE_VERSION
  - bundle install --path vendor/bundle
  - npm install
script:
  - bundle exec jekyll build
after_success:
  - npm install aerobatic-cli -g
  - aero deploy \
    --commit-url "https://github.com/owner/repo-name/commit/${TRAVIS_COMMIT}" \
    --directory _site
---
~~~

You'll notice in the `aero deploy` call above we are passing two arguments: `--commit-url` and `--directory`. The `commit-url` is simply the URL to the commit that triggered the build. This is optional, but if provided the Aerobatic control panel will include a link back to this URL in the deployment history which can be helpful for maintaining a connection between the code changes and what was deployed. The `directory` argument is the directory where the built assets were written which, in the case of jekyll, defaults to `_site`. This can be specified as a CLI arg or it can be [declared in the `deploy` section](/docs/configuration) of `aerobatic.yml`.

### API Key environment variable {#aerobatic-apikey}

An environment variable named `AEROBATIC_API_KEY` needs to be set in the build script in order to make authenticated calls to the Aerobatic API. Each CD service has a mechanism for setting environment variables. It's recommended that the value be encrypted if your service supports it. Travis provides a [command line tool](https://docs.travis-ci.com/user/environment-variables/#Encrypting-environment-variables) for encrypting a variable and injecting it into the `.travis.yml` file:

~~~sh
$ travis encrypt AEROBATIC_API_KEY=<your_api_key> --add env.global
~~~

You can get the value of your enviroment variable by running the [apikey command](/docs/cli#apikey). All websites associated with an Aerobatic account will have the same API key value.

~~~sh
$ aero apikey
~~~

### Deploy stages

The example above will deploy any branch configured for CI to the production branch. However you may want to deploy different branches to different instances of your website. This is straightforward using Aerobatic [deploy stages](/docs/configuration#deploy-stages) - albeit with a little bash trickery. We are now passing an additional `stage` argument which specifies the name of the stage to deploy to. If the stage name is anything other than "production", the stage is incorporated into the deployed URL, i.e. `https://www--test.domain.com` or `https://test.domain.com` (if the production URL is using an apex domain). This script is using the convention that the `master` branch is deployed to production and anything else is deployed to a stage named the same as the branch.

~~~yaml
after_success:
  - npm install aerobatic-cli -g
  - aero deploy \
    --commit-url "https://github.com/owner/repo-name/commit/${TRAVIS_COMMIT}" \
    --stage $([ $TRAVIS_BRANCH = 'master' ] && echo 'production' || echo $TRAVIS_BRANCH ) \
    --directory _site
---
~~~

{{% alert tip %}}
This setup is a bit cleaner with some of the other CI services. For example [Bitbucket Pipelines](https://confluence.atlassian.com/bitbucket/configure-bitbucket-pipelines-yml-792298910.html#Configurebitbucket-pipelines.yml-ci_branchesbranches(optional)) and [Circle CI](https://circleci.com/docs/configuration/#deployment) (and probably others) provide the flexibility to define distinct deploy steps per branch.
{{% /alert %}}
