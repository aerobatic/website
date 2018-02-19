---
plugin: true
title: Client config plugin
name: client-config
---

# Client config plugin

The `client-config` plugin is used to emit a JSON configuration object into the `<head>` of your html pages. This is useful when you want to inject configuration settings for different [deploy stages](/configuration/#deploy-stages) at run-time based on environment variables. Not only can environment variables have different values for different deploy stages, but they can also be updated on the fly (either in the CLI or dashboard), without having to to change without having to trigger a whole new deployment.

Since the settings must be consumed with client JavaScript, this technique is mostly applicable to JavaScript web apps.

In addition the the settings you explicitly specify, additional contextual keys are appended to the object including: `deployStage`, `appName`, and `versionId`.

### Usage

```yaml
plugins:
  - name: client-config
    options:
      variableName: config
      customSetting1: $SETTING_1
      customSetting2: $SETTING_2
```

### Options

{{% option "variableName" %}}
The name of the global JavaScript variable the config object is assigned to. Defaults to `__aerobatic__`.
{{% /option %}}

### Output

Looking the HTML source after deploying your website, the plugin causes a blob similar to below to be emitted in your document `<head>`. Here it is shown formatted for readability, the actual output is minified.

```html
<script>window['__aerobatic__'] = {
  "customSetting1": "abc",
  "customSetting2": "123",
  "versionId": "0768d7b4-6c31-40e7-b337-54de5d6d7e99",
  "appName": "client-config-test"
};
</script>
```
