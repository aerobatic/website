---
title: Custom errors plugin
plugin: true
name: custom-errors
---

# Custom errors plugin

By default Aerobatic will render a friendly error page for HTTP error responses such as `404`, `500`, `403`, etc. The `custom-errors` plugin allows you to override those pages with your own custom pages.

### Usage

~~~yaml
plugins:
  - name: custom-errors
    options:
      errors:
        500: errors/500.html
        404: errors/404.html
        401: errors/401.html
---
~~~

#### Sample Custom Errors App

- Here is a basic example web site that uses the Aerobatic `custom-errors` plugin. [http://custom-errors.aerobatic.io/](http://custom-errors.aerobatic.io/)
- The code for this sample app can be found on Bitbucket at [https://bitbucket.org/aerobatic/custom-errors/src](http://custom-errors.aerobatic.io/)
