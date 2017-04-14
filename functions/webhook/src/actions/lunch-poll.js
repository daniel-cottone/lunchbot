'use strict';
import 'babel-polyfill';

let lunchPoll = exports;

lunchPoll.startPoll = function (e, cb) {
  const reply = {
    speech: 'Webhook fulfilled!',
    displayTest: 'Webhook fulfilled!',
    data: {
      slack: {
        text: `<!here> <@${e.originalRequest.data.event.user}> would like to go to lunch! Let them know you want to come!`,
        attachments: [
          {
            text: `*Cool Kids:* <@${e.originalRequest.data.event.user}>`,
            color: 'good',
            callback_id: 'lunch_poll_start',
            attachment_type: 'default',
            mrkdwn_in: [ 'text' ],
            actions: [
              {
                name: 'join',
                text: 'I\'m in!',
                type: 'button',
                value: 'lunch_poll_join'
              }
            ]
          }
        ]
      }
    },
    contextOut: [],
    source: 'Lambda'
  };

  cb(null, reply);
};

lunchPoll.joinPoll = function (e, cb) {

};
