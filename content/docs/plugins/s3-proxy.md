---
title: S3 proxy plugin
plugin: true
name: s3-proxy
---

# S3 proxy plugin

The `s3-proxy` plugin provides a way to proxy to files stored in an S3 bucket that you own. This is useful if you have a large set of media files (images, videos, PDFs, etc.) that change infrequently, or not at all, and thus inefficient to be constantly re-deploying as part of your main website.

The plugin will honor any cache headers set in the S3 metadata, or you can configure the plugin to override the cache headers. The origin S3 bucket does **_not_** need to be configured for web hosting. The files will be cached on the Aerobatic CDN for accelerated downloads.

### Usage

```yaml
plugins:
  - name: s3-proxy
    path: /s3-media
    options:
      bucket: bucket-name
      accessKeyId: $S3_ACCESS_KEY_ID
      secretAccessKey: $S3_SECRET_ACCESS_KEY
      overrideCacheControl: max-age=2592000
      region: us-west-2
```

In the example above the plugin is mounted at the path `/s3-media`, but it doesn't expect a folder in S3 called `s3-media`. The S3 path corresponds to everything that follows `/s3-media/` in the URL sent to the proxy plugin. So if you had the following HTML:

```html
<img src="/s3-media/images/photos/rainbow.jpg">
```

The proxy will request the S3 object from your bucket with the key `images/photos/rainbow.jpg` - assuming you do not have a `prefix` option specified. If the value of `prefix` is set to "website", then the expected S3 path becomes `website/images/photos/rainbow.jpg`.

### Options

{{% option accessKeyId %}}
The AWS access key of the IAM user to connect to S3 with (environment variable recommended).
{{% /option %}}

{{% option secretAccessKey %}}
The AWS secret access key (environment variable recommended).
{{% /option %}}

{{% option region %}}
The AWS region of the bucket, i.e. “us-west-2”.
{{% /option %}}

{{% option bucket %}}
The name of the S3 bucket.
{{% /option %}}

{{% option prefix %}}
Optional path to the root S3 folder where the files to be hosted live. If omitted, the http requests to the proxy need to mirror the full S3 path.
{{% /option %}}

{{% option defaultCacheControl %}}
Value of the `Cache-Control` header to use if the metadata from the S3 object does not specify it’s own value.
{{% /option %}}

{{% option overrideCacheControl %}}
Value of the Cache-Control header that is applied to the response even if there there is a different value on the S3 object metadata.
{{% /option %}}

<a id="create-iam-user"></a>

### Creating the AWS IAM user

The `accessKeyId` and `secretAccessKey` options should correspond to an IAM user that has the [`s3:GetObject`](http://docs.aws.amazon.com/AmazonS3/latest/API/RESTObjectGET.html) permission. For security reasons it is recommended that you create a dedicated IAM user whose only permissions are to read from the bucket that you are proxying to.

1. To create the IAM user, follow [these instructions](http://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html#id_users_create_console). You can name the user anything you like, but something descriptive like `AerobaticS3Proxy` will help make it obvious what it's for. Make sure that **Generate an access key for each user** is selected. This user **does not** require a password.
2. Download or copy and paste the access key and secret key. These will be stored later as Aerobatic environment variables.
3. Now you need to attach an IAM policy to the user to control which actions the user can perform. On the IAM user summary screen perform the following sequence of navigations: click **Permissions** tab > **Create User Policy** > **Custom Policy** > **Select** button at right.
4. In the **Policy Name** enter a value like "AerobaticS3ProxyPolicy". In the **Policy Document** paste the contents below making sure to replace `<your_bucket_name>` appropriately.
5. Store the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` values you got from step 1 as environment variables in the Aerobatic console following [these instructions](/docs/configuration#environment-variables).
6. Finally, configure the `s3-proxy` plugin in your `aerobatic.yml` file referencing the environment variables as shown in the example usage at the top of this page.

**Policy Document**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Stmt1447214909000",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::<your_bucket_name>/*"]
    }
  ]
}
```

<a id="transfer-charges"></a>

### S3 transfer charges

If your S3 bucket is located in a different region than our EC2 origin server handling a proxied request, then you will incur standard [S3 cross region transfer rates](https://aws.amazon.com/s3/pricing/) of $0.020 per GB. We currently operate origin servers in both `us-west-2` and `eu-central-1`. So if your bucket is in `us-west-2` and a US based visitor to your website (who is most likely routed to our `us-west-2` servers), you will not incur any AWS charges. The same would be true for European visitors if your bucket is in `eu-central-1`.

You can mitigate these charges, and boost download performance at the same time, by either setting the `Cache-Control` in the [S3 object metadata](http://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#ExpirationAddingHeadersInS3) or setting the `defaultCacheControl` or `overrideCacheControl` options described above. If you know that the contents of the S3 objects are not going to change, you can set an aggressive `Expires` value which will result in the vast majority of HTTP requests for proxied objects to be served from the CloudFront edge cache, avoiding the hit on your bucket entirely.

### Cache invalidation

While a surefire way to force all clients to get the latest version of an object is to upload it to S3 with a new name, that's not always a desirable option. If you want to overwrite an object and preserve the original name, Aerobatic provides an alternate mechanism to modify the URL to ensure that all clients immediately receive the updated version.

Simply include a segment in the URL path that starts with a double dash:

```html
<!-- original -->
<img src="/s3-proxy/images/screenshot.png">

<!-- after re-uploading screenshot.png -->
<img src="/s3-proxy/--1/images/screenshot.png">

<!-- after re-uploading screenshot.png again -->
<img src="/s3-proxy/--2/images/screenshot.png">
```

The special double-dash segment will be stripped out of the S3 key, so you don't actually create a folder in S3 called `--1`. This is just a way to force the CDN, browser, and any other caches to interpret the request as a unique object.

More details on how to use the S3 Proxy can be found in this [blog post](/blog/faster-website-deployment-with-bitbucket-and-s3/).
