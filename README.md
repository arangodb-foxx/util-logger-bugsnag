# The BugSnag Logging App

The BugSnag logging app provides a Foxx script and `Foxx.queues` job type for logging errors with [BugSnag](https://bugsnag.com/).

**Note:** Version 2.0.0 and higher require ArangoDB 2.6 or later to work correctly.

*Examples*

First add this app to your dependencies:

```js
{
  ...
  "dependencies": {
    "logger": "logger-bugsnag:^2.0.0"
  }
  ...
}
```

Once you've configured both apps correctly, you can use it like this:

```js
var Foxx = require('org/arangodb/foxx');
var queue = Foxx.queues.get('default');

queue.push(applicationContext.dependencies.logger, {
  exceptions: [new Error('Something went wrong!')]
});
```

## Configuration

This app has the following configuration options:

* *apiKey*: Your BugSnag API key.
* *appVersion*: The version number of your BugSnag app.
* *releaseStage* (optional): The release stage of your BugSnag app (i.e. development or production). Default: *"production"*.
* *hostname* (optional): The hostname of your BugSnag app. Default: *"localhost"*.
* *maxFailures* (optional): The maximum number of times each job will be retried if it fails. Default: *0* (don't retry).

## Job Data

The BugSnag logger job expects an array of objects with the following properties:

* *exceptions*: an array of exceptions. See below.
* *context* (optional): an arbitrary string.
* *groupingHash* (optional): an arbitrary string.
* *severity* (optional): any of *"error"*, *"warning"*, or *"info"*. Default: *"error"*.
* *user* (optional): an arbitrary object.
* *metaData* (optional): an arbitrary object.

In addition to the objects of the format expected by the BugSnag API, *exceptions* objects can be regular *Error* instances. These will be converted automatically and their stack traces (if any) will be converted to the format expected by BugSnag.

For full documentation of all job data options supported by BugSnag see [the official BugSnag API documentation](https://bugsnag.com/docs/notifier-api).

## License

This code is distributed under the [Apache License](http://www.apache.org/licenses/LICENSE-2.0) by ArangoDB GmbH.
