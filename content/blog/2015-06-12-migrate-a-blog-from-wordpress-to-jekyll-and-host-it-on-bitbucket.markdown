---
author: Jason Gowans
comments: true
date: 2015-06-12
layout: post
comments: true
title: How to Migrate a Blog from Wordpress to Jekyll
description: Aerobatic makes it simple to move your Wordpress site to Jekyll and host it using our Bitbucket static hosting add-on.
slug: migrate-a-blog-from-wordpress-to-jekyll-and-host-it-on-bitbucket
sitemap:
    lastmod: 2016-03-15
---

{% alert warning %}
**UPDATE:** Aerobatic now has [built-in support](/blog/automated-continuous-deployment-of-jekyll-sites) for building Jekyll sites. You no longer need to rely upon an external CI service for this.
{% endalert %}

This is a cross post from [jasongowans.net](http://www.jasongowans.net/2015/06/12/migrate-a-blog-from-wordpress-to-jekyll-and-host-it-on-bitbucket/)

As an ocassional blogger, I hosted my blog with wordpress.com for years almost by default. It's easy and dependable, but it's not free if you want a custom domain, and well, it's Wordpress. As a co-founder of [Aerobatic](http://aerobatic.com/), I'm supposed to have a cool [Jekyll](http://jekyllrb.com/) blog, or something, so here we are - How to move a Wordpress blog to Jekyll and host it on Aerobatic using the Aerobatic add-on for Bitbucket. Think Github Pages but with free private repos courtesy of Bitbucket, and CDN, custom domains, SSL, and more courtesy of Aerobatic.

###Step 1: Export from Wordpress
First thing to do is to export your Wordpress blog by going to wordpress.com, and in the left nav of the admin console, click tools, and then export.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/export-wordpress.png">

This will create an XML file of all your Wordpress data.

###Step 2: Install exitwp
A Swede named [Thomas Frössman](http://thomas.jossystem.se/) created this nifty utility that converts the blog posts in the Wordpress XML file that you've just created, into markdown files that are needed for your Jekyll blog.

{% highlight ruby %}
git clone https://github.com/thomasf/exitwp.git
{% endhighlight %}

In my case, I also needed to run an extra setup step:

{% highlight ruby %}
sudo pip install --upgrade -r pip_requirements.txt
{% endhighlight %}

Once you've succcessfully installed exitwp, make sure you place your wordpress XML file into the <code>wordpress-xml</code> folder. Then, back in the root directory of the exitwp repo, from the command line type:

{% highlight ruby %}
python exitwp.py
{% endhighlight %}

When it's finished, there's a new folder created called <code>build</code> in the exitwp repo root. Click through the various subfolders to the <code>\_posts</code> folder and you should now see all of your old Wordpress blog posts in beautiful markdown, ready to drop into your shiny new Jekyll blog!

###Step 3: Download a Jekyll Theme
[Jekyll Themes](http://jekyllthemes.org/) is a great option for getting going quickly with a Jekyll blog. Once you've downloaded the theme of your choice, assuming you have Jekyll installed, in the root of your new Jekyll blog folder, from the command line, type:

{% highlight ruby %}
jekyll serve
{% endhighlight %}

You should now have your blog running localhost. At this point, you can then copy over all of your markdown files into the <code>\_posts</code> folder. Hit refresh in your browser and boom - you now have a Jekyll blog!

###Step 4: Create a bitbucket repo
While the hardcore programmers will likely cackle in unison, personally, I'm a fan of [SourceTree](https://www.atlassian.com/software/sourcetree). So, using SourceTree, you can create a new private repo. Did I mention the private repos are free on Bitbucket?

<table style="border:1px">
  <tr>
    <td style="padding:10px"><img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/create-repo.png"></td>
    <td style="padding:10px"><img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/private-repo.png"></td>
  </tr>
</table>

<p class="bg-info"><b>Important:</b> Make sure that in your gitignore file, you remove <code>_site</code>. This is where Jekyll generates your actual site, and since we'll be hosting this via Bitbucket, you'll actually want to commit those files to Bitbucket too.</p>

###Step 5: Install the Aerobatic Add-On
Now that you've created your repo on Bitbucket, you'll next want to install the Aerobatic add-on. This is a one-time step and you won't need to do this for each and every repo. So, from the Bitbucket UI, click on your avatar in the upper right corner, select manage account, and then in the left nav, you'll see the add-ons sub menu.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/new-add-ons.png">

###Step 6: Publish your Site
From your repo summary page, click the Aerobatic Hosting link. Make sure that you select the sub-folder checkbox option and you tell Aerobatic where your code is, in this case, <code>/\_site</code>

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/link-repo.png">

Once linked, you'll get a dialog informing you that your app has been created and to push your code to publish your first version.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/no-deploy.png">

Once you've pushed your code, refresh the page and you should see that your first version is now live. One neat feature of Aerobatic is that it retains a full history of all previously deployed versions that are available via their own unique URL.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/deployed.png">

###Step 7: Bonus - Custom Domains
In my case, my blog is now live at [http://dundonian.aerobaticapp.com/](http://dundonian.aerobaticapp.com/), but if I wanted to add a custom domain, Aerobatic supports that too.

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/custom-domain.png">

For example, [jasongowans.net](http://jasongowans.net/) now points to my blog:

<img class="img-responsive marketing-feature-showcase--screenshot" src="//www.aerobatic.com/media/blog/migrateblog/jasongowans.png">

<p class="bg-info"><b>Note:</b> Registering a CNAME can take some time to take effect (for mine it took about 10 minutes). In the meantime, you might get a "Bad Request" error if you type in the URL. Just be patient...</p>

###Step 8: Bonus - Form submission without PHP
With many of the Jekyll Themes, they come with a contact form that depends on PHP. Given that our hosting solution only support static content, that PHP won't execute. So, what to do? Well, lately I've been using a service called [formspree](http://formspree.io/).

With formspree, you set your form to post to an email address of your choice, and formspree handles the rest.

In the JavaScript file that contains your contact form code, simply change the URL from referencing your contact PHP file to something like this:

{% highlight ruby %}
$.ajax({
url: "//formspree.io/jason@aerobatic.com",
type: "POST",
data: {
name: name,
phone: phone,
email: email,
message: message
},
{% endhighlight %}

The first time you submit the form, you'll be asked to confirm the email address. This is a one time step that you'll need to complete for both your localhost as well as your deployed public version.

###Step 9: Bonus - Google Analytics
You've got your blog up and running and now you want to know how much traffic it's getting. Setting up Google Analytics is pretty straightforward. In your <code>\_includes</code> folder, create a new file called <code>google_analytics.html</code>

In that file, you'll want to paste in the tracking code that Google provides. It should look something like the following:

{% highlight ruby %}

<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-99999999-1', 'auto');
  ga('send', 'pageview');

</script>

{% endhighlight %}

Simply replace the "UA-999..." placeholder ID with your own Google Analytics tracking ID. Once this is done, you'll then update the <code>default.html</code> page in your <code>\_layouts</code> folder to include the <code>google_analytics.html</code> file you just created:

{% highlight ruby %}

<html lang="en">
{{ "{% include head.html " }}%}
{{ "{% include google_analytics.html " }}%}
<body>
    {{ "{% include nav.html " }}%}
    {{ "{{ content " }}}}
    {{ "{% include footer.html " }}%}
</body>
</html>
{% endhighlight %}

And that's it! In less than an hour, we've converted our blog from Wordpress to Jekyll, and we've configured free hosting via Bitbucket that includes CDN, deployment versions, custom domains, contact form submission, and Google Analytics.

If you run into any issues following these steps, feel free to drop me a note via my contact form. You're also free to check out my [blog repo on Bitbucket](//bitbucket.org/dundonian/blog/src) so you can see things like the folder structure and my <code>\_config.yml</code> etc. Good luck!
