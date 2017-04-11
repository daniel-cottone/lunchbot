'use strict';
import rp from 'request-promise';
import 'babel-polyfill';

exports.handler = (e, ctx, cb) => {
  console.log('Handling event: %j', e);

  const response = {
    speech: 'Webhook fulfilled!',
    displayTest: 'Webhook fulfilled!',
    data: {
      slack: {
        text: 'Webhook fulfilled!'
      }
    },
    contextOut: [],
    source: 'Lambda'
  };
  cb(null, response);
};
