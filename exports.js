/*global require, module, applicationContext */
'use strict';
var joi = require('joi');
var extend = require('underscore').extend;

module.exports = {
  mount: applicationContext.mount,
  name: 'mailer',
  schema: joi.array().includes({
    exceptions: joi.array().required(),
    context: joi.string().optional(),
    groupingHash: joi.string().optional(),
    severity: joi.string().valid('error', 'warning', 'info').default('error'),
    user: joi.object().optional(),
    metaData: joi.object().optional()
  }),
  preprocess: function (data) {
    return data.map(function (event) {
      return extend({}, event, {
        exceptions: event.exceptions.map(function (err) {
          return err instanceof Error ? {
            errorClass: err.constructor.name || err.name || 'Error',
            message: err.message,
            stacktrace: err.stack
          } : err;
        })
      });
    });
  },
  maxFailures: applicationContext.configuration.maxFailures
};
