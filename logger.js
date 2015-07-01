/*global require, module, applicationContext */
'use strict';
var extend = require('underscore').extend;
var request = require('org/arangodb/request');
var parseStacktrace = require('./parseStacktrace');

var data = require('./exports').schema.validate(applicationContext.argv[0]);
if (data.error) {
  throw data.error;
}

function format(data) {
  return data.map(function (event) {
    return {
      payloadVersion: "2",
      exceptions: event.exceptions.map(function (err) {
        return extend({}, err, {
          stack: err.stack ? parseStacktrace(err.stack) : []
        });
      }),
      context: event.context,
      groupingHash: event.groupingHash,
      severity: event.severity,
      user: event.user,
      app: {
        version: applicationContext.configuration.releaseStage.appVersion,
        releaseStage: applicationContext.configuration.releaseStage
      },
      device: {
        hostname: applicationContext.configuration.hostname
      },
      metaData: event.metaData
    };
  });
}

var response = request.post('https://notify.bugsnag.com/', {
  body: {
    apiKey: applicationContext.configuration.apiKey,
    notifier: {
      name: applicationContext.manifest.name,
      version: applicationContext.manifest.version,
      url: 'https://github.com/arangodb/foxx-logger-bugsnag'
    },
    events: format(data.value),
  },
  json: true,
  headers: {
    'accept': 'application/json',
    'content-type': 'application/json'
  }
});

if (Math.floor(response.statusCode / 100) !== 2) {
  throw new Error('Server sent an empty response with status ' + response.statusCode);
}

module.exports = response.body;
