'use strict';
import qs from 'qs';
import 'babel-polyfill';

function joinLunchPoll(e, cb) {
  let response = e.original_message;
  if (response.attachments[0].text.includes(e.user.id)) {
    alreadyJoined(e, cb);
  } else {
    response.attachments[0].text += ` <@${e.user.id}>`;
    cb(null, response);
  }
}

function alreadyJoined(e, cb) {
  const response = {
    response_type: 'ephemeral',
    replace_original: false,
    text: 'You\'ve already joined!'
  };
  cb(null, response);
}

function errorResponse(e, cb) {
  const response = {
    response_type: 'ephemeral',
    replace_original: false,
    text: 'Sorry, something bad happened. Yell at Daniel to fix it!'
  };
  cb(null, response);
}

function parsePayload(e) {
  const data = qs.parse(e.payload);
  const parsed = JSON.parse(data.payload);
  return parsed;
}

function handleEvent(e, cb) {
  console.log('Handling event: %j', e);
  const event = parsePayload(e);
  const action = event.actions[0].value;
  switch(action) {
    case 'lunch_poll_join':
      joinLunchPoll(event, cb);
      break;
    default:
      errorResponse(event, cb);
      break;
  }
}

exports.handler = (e, ctx, cb) => {
  handleEvent(e, cb);
};
