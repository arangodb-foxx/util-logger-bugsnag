/*jshint indent: 2, nomen: true, maxlen: 120 */
/*global require, exports, applicationContext */
(function () {
  'use strict';
  var queues = require('org/arangodb/foxx').queues,
    internal = require('internal'),
    joi = require('joi'),
    parseStacktrace = require('./parseStacktrace'),
    schema;

  queues.registerJobType(applicationContext.configuration.jobType, {
    schema: joi.array().includes({
      exceptions: joi.array().includes(joi.object()).required(),
      context: joi.string().optional(),
      groupingHash: joi.string().optional(),
      severity: joi.string().valid('error', 'warning', 'info').default('error'),
      user: joi.object().optional(),
      metaData: joi.object().optional()
    }),
    maxFailures: applicationContext.configuration.maxFailures,
    execute: function (events) {
      var response, body;
      response = internal.download(
        'https://notify.bugsnag.com/',
        JSON.stringify({
          apiKey: applicationContext.configuration.apiKey,
          notifier: {
            name: applicationContext.manifest.name,
            version: applicationContext.manifest.version,
            url: 'https://github.com/arangodb/foxx-logger-bugsnag'
          },
          events: events.map(function (event) {
            return {
              payloadVersion: "2",
              exceptions: event.exceptions.map(function (err) {
                return err instanceof Error ? {
                  errorClass: err.name || err.constructor.name || 'Error',
                  message: err.message,
                  stacktrace: err.stack ? parseStacktrace(err.stack) : []
                } : err;
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
          }),
        }),
        {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json'
          }
        }
      );
      if (response.body) {
        body = JSON.parse(response.body);
        if (body.response.status !== 'ok') {
          throw new Error(
            'Server returned status ' +
            body.response.status +
            ' with message: ' +
            body.response.message
          );
        }
        return body;
      }
      if (Math.floor(response.code / 100) !== 2) {
        throw new Error('Server sent an empty response with status ' + response.code);
      }
    }
  });

  Object.defineProperty(exports, 'jobType', {
    get: function () {
      return applicationContext.configuration.jobType;
    },
    configurable: false,
    enumerable: true
  });
}());