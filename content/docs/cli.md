---
title: CLI
name: cli
---

# Command Line Tool

The `aerobatic-cli` is a way to interact with the Aerobatic platform via the command line and the only way to deploy new versions. You can run it from your local machine, or from a build script in a [continuous deployment workflow](/docs/continuous-deployment).

## Installation

The CLI is installed via npm:

~~~sh
[$] npm install aerobatic-cli --global
~~~

### Usage
Once installed, the command `aero` should be globally available on your system. Running `aero help` will display a list of all the available commands:

~~~sh
Usage:
    $ aero [command] [options]

Commands:
    account        Display a summary of the current Aerobatic account.
    apikey         Get the api key for the current Aerobatic account.
    create         Create a new Aerobatic website in the current directory
    delete         Delete the current website
    deploy         Deploy the website in the current directory.
    domain         Register a custom domain for the current website
    env            Set or retrieve environment variables
    info           Display a summary of the current website
    login          Login to your Aerobatic account
    logs           Tail the web logs for the current website
    register       Register a new Aerobatic account
    rename         Rename the website
    switch         Switch to a different Aerobatic account
    versions       Manage website versions

    Type aero help COMMAND for more details
~~~

### Behind a proxy

The CLI will honor the `HTTPS_PROXY` environment variable when making outbound network calls.

### Commands

* [account](#account)
* [apikey](#apikey)
* [create](#create)
* [delete](#delete)
* [deploy](#deploy)
* [domain](#domain)
* [env](#env)
* [info](#info)
* [login](#login)
* [logs](#logs)
* [register](#register)
* [rename](#rename)
* [switch](#switch)
* [versions](#versions)

#### account
Display a summary of the current Aerobatic account including the list of websites.

~~~bash
[$] aero account
~~~

#### apikey
Get the api key for the current Aerobatic account. This value should be set as the `AEROBATIC_API_KEY` environment variable in a CI service. Read about [setting up a CI environment](/docs/continuous-deployment#aerobatic-apikey). Run with the `--reset` arg to reset to a new value.

**Options**
{{% option "-R, --reset" %}}
Reset the account api key to a new value.
{{% /option %}}

**Examples**
~~~bash
[$] aero account
[$] aero account --reset
~~~

#### create
Create a new Aerobatic website in the current directory. If no `aerobatic.yml` file exists in the current directory, a new one will created. If there is already an `aerobatic.yml` file, then the "id" property will overriden with the new website's unique identifier.

**Options**
{{% option "-S, --source" %}}
URL to a `.zip` or `.tar.gz` archive to create the new website from. This will automatically create a new directory.
{{% /option %}}

**Examples**
~~~bash
[$] aero create # Creates website at the current directory
[$] aero create --source https://html5up.net/editorial/download
[$] aero create -S https://github.com/BlackrockDigital/startbootstrap-business-casual/archive/gh-pages.zip
~~~

#### delete
Delete the website at the current directory. This will take down the website resulting in a 404 page. If the site is subscribed to the Pro plan, recurring payments will stop. You will be prompted to confirm the name of the website.

~~~bash
[$] aero delete
~~~

#### deploy
Deploy a new version of the website in the current directory.

**Options**
{{% option "-d, --directory" %}}
Specify the sub-directory where the built website assets are located. This overrides any value specified in the `deploy` section of the `aerobatic.yml` file. If no value is specified in either location the current directory is deployed.
{{% /option %}}

{{% option "-s, --stage" %}}
Specify the [deploy stage](/docs/overview#deploy-stages) for the deployment. This impacts the URL of the deployed version. For example passing `--stage test` will make the new version available at `https://www--test.customdomain.com` or `https://SITENAME--test.aerobatic.io`. If no value is provided then the deployment will target the production URL.
{{% /option %}}

{{% option "-m, --message" %}}
A short message that you want to attach to the deployment metadata. If being [invoked from a CI server](/docs/continuous-deployment), it may be useful to pass the git commit message and the URL to the commit details that triggered the build. This information will be displayed in the Aerobatic control panel as part of the deployment history.
{{% /option %}}

{{% option "-c, --commit-url" %}}
: The URL to the commit that triggered this deployment. Also mostly useful when being invoked by a CI server. This URL will be linkable from the Aerobatic control panel.
{{% /option %}}

**Examples**
~~~bash
[$] aero deploy
[$] aero deploy --directory _site
[$] aero deploy --stage test
[$] aero deploy --message "Commit message" --commit-url https://github.com/owner/repo/commit/2495349f
~~~

#### domain
Register a custom domain for the current website. This command requires that your website has already been upgraded to the Pro plan. If you want to run your website at the apex domain, i.e. `https://mydomain.com`, your DNS provider needs to support `ANAME` or `ALIAS` records. For details see the [apex domains docs](/docs/custom-domains-ssl/#apex-domains).

**Options**
{{% option "-n, --name" %}}
The name of the domain (without any sub-domain, i.e. `mydomain.com`)
{{% /option %}}

{{% option "-N, --subdomain" %}}
The subdomain you want your website to be accessible at. For apex domain enter the value '@'.
{{% /option %}}

You can also run the command without any arguments to get status information on the domain.

~~~bash
[$] aero domain --name mydomain.com --subdomain www
[$] aero domain --name mydomain.com --subdomain @
[$] aero domain
~~~

#### info
Display summary information about the current website.

~~~bash
[$] aero info
~~~

#### login
Login to your Aerobatic account. You'll be prompted to enter your email and password. If your credentials are correct, a file is written at `~/.aerorc.yml` with an auth token that is passed in subsequent commands. The token is valid for 24 hours after which you'll be prompted to login again.

~~~bash
[$] aero login
~~~

#### logs
Tail the web logs for the current website. Gives a near real-time snapshot of the HTTP requests and responses being served from your site including geoip location.

~~~bash
[$] aero logs
~~~

#### register
Register for a new Aerobatic account. You'll be prompted for email, password, and organization name. A automated email will be sent to the email with a verification link. Once clicked you'll be able to run `aero login`.

~~~bash
[$] aero register
~~~

#### rename
Rename the current website. On the Pro plan this only changes the name displayed in the Aerobatic Control Panel. But for the free plan this changes the URL of the site, i.e. `https://SITENAME.aerobatic.io`.

**Options**
{{% option "-n, --name" %}}
The new name of the website
{{% /option %}}

~~~bash
[$] aero rename -n "new-website-name"
~~~

#### switch
Switch to a different Aerobatic account. Displays a list of all the accounts you are associated with and let's you choose which one subsequent commands should be run in the context of.

~~~bash
[$] aero switch
~~~

#### versions
Manage website versions including displaying all versions, deleting versions, pushing a version to a deploy stage, and deleting a deploy stage. Which action is carried out depends on the combination of options provided.

**Options**
{{% option "-n, --name" %}}
The name of the version (i.e "v21") or version number "21" of the version to act on.
{{% /option %}}

{{% option "-D, --delete" %}}
Delete the version identified by the `--name` option.
{{% /option %}}

{{% option "-s, --stage" %}}
If specified in conjunction with the `--name` option, indicates the stage to push the version to. If used in conjunction with the `--delete` option, then this specifies the stage to delete.
{{% /option %}}

~~~bash
[$] aero versions                                 # Display a list of all versions
[$] aero versions -D --name v21                   # Delete version v21
[$] aero versions --name v2 --stage production    # Deploy version v2 to production stage
[$] aero versions -n v3 -s test                   # Deploy version v3 to test stage
[$] aero versions --delete --stage test           # Delete the test deploy stage
~~~
