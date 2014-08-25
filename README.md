# The BugSnag Logging App

The BugSnag logging app provides a `Foxx.queues` job type for logging errors with [BugSnag](https://bugsnag.com/).

*Examples*

```js
var Foxx = require('org/arangodb/foxx')
    queue = Foxx.queues.create('my-queue', 1);

queue.push('logger.bugsnag', {
});

// or if you prefer not to hardcode the job type:

queue.push(Foxx.requireApp('/bugsnag-mountpoint').logger.jobType, {
    // ...
});
```

## Configuration

This app has the following configuration options:

* *apiKey*: Your BugSnag API key.
* *appVersion*: The version number of your BugSnag app.
* *releaseStage* (optional): The release stage of your BugSnag app (i.e. development or production). Default: *"production"*.
* *hostname* (optional): The hostname of your BugSnag app. Default: *"localhost"*.
* *jobType* (optional): The name under which the logger app's job type will be available. Default: *logger.bugsnag*.
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
