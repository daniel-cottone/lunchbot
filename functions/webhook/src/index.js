'use strict';
import { decrypt } from './aws-kms.js';
import { getRestaurants } from './actions/get-restaurants.js';
import { startPoll, joinPoll } from './actions/lunch-poll.js';
import 'babel-polyfill';

const encryptedEnvProperties = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
};
let decryptedEnvProps;

function handleEvent(e, cb, params) {
  console.log('Handling event: %j', e);
  switch(e.result.action) {
    case 'get_restaurants':
      getRestaurants(e, cb, params);
      break;
    case 'lunch_poll_start':
      startPoll(e, cb);
      break;
    case 'lunch_poll_join':
      joinPoll(e, cb);
      break;
    default:
      cb('unknown action', null);
      break;
  }
}

exports.handler = (e, ctx, cb) => {
  if (decryptedEnvProps) {
    handleEvent(e, cb, decryptedEnvProps);
  } else {
    decrypt(encryptedEnvProperties, process.env.AWS_REGION).then(decrypted => {
      decryptedEnvProps = decrypted;
      handleEvent(e, cb, decryptedEnvProps);
    }).catch(error => {
      console.log('Error: %j', error);
      cb(error, null);
    });
  }
};
