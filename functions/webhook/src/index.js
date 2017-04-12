'use strict';
import aws from 'aws-sdk';
import rp from 'request-promise';
import yelp from 'yelp-fusion';
import 'babel-polyfill';

function getDecryptPromise(s) {
  const kms = new aws.KMS({ region: process.env.AWS_REGION });
  let params = {
    'CiphertextBlob': new Buffer(s, 'base64')
  };
  return kms.decrypt(params).promise();
}

function kmsDecrypt() {
  const clientIdPromise = getDecryptPromise(process.env.CLIENT_ID);
  const clientSecretPromise = getDecryptPromise(process.env.CLIENT_SECRET);

  return Promise.all([clientIdPromise, clientSecretPromise]).then(values => {
    return {
      clientId: values[0].Plaintext.toString(),
      clientSecret: values[1].Plaintext.toString()
    };
  }).catch(error => {
    console.log('Error: %j', error);
  });
}

exports.handler = (e, ctx, cb) => {
  console.log('Handling event: %j', e);
  const searchRequest = {
    term: e.result.parameters.cuisine,
    location: '26 Century Boulevard, Nashville, TN',
    radius: 8000,
    //open_now: true,
    limit: 10
  };

  kmsDecrypt().then(params => {
    yelp.accessToken(params.clientId, params.clientSecret).then(response => {
      const client = yelp.client(response.jsonBody.access_token);

      client.search(searchRequest).then(response => {
        console.log('Response: %j', response);

        const slackText = `I found *${response.jsonBody.total}* results for *${searchRequest.term}*. Here's a few of them:`;
        let slackAttachments = [];

        for (let business of response.jsonBody.businesses) {
          let attachment = {
            title: `${business.name}`,
            thumb_url: business.image_url,
            pretext: `*Rating:* ${business.rating}*  *Price:* ${business.price}`,
            text: `Yelp URL: ${business.url.split('?')[0]}`,
            mrkdwn_in: [ 'pretext', 'text' ]
          };
          slackAttachments.push(attachment);
        }

        const reply = {
          speech: 'Webhook fulfilled!',
          displayTest: 'Webhook fulfilled!',
          data: {
            slack: {
              text: slackText,
              attachments: slackAttachments
            }
          },
          contextOut: [],
          source: 'Lambda'
        };
        cb(null, reply);

      }).catch(error => {
        console.log('Error: %j', error);
        cb(error, null);
      });
    });

  }).catch(error => {
    console.log('Error: %j', error);
    cb(error, null);
  });
};
