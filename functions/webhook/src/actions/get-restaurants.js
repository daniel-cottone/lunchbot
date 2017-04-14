'use strict';
import yelp from 'yelp-fusion';
import 'babel-polyfill';

exports.getRestaurants = function (e, cb, params) {
  const searchRequest = {
    term: e.result.parameters.cuisine,
    location: '26 Century Boulevard, Nashville, TN',
    radius: 5000,
    limit: 10
  };

  yelp.accessToken(params.clientId, params.clientSecret).then(response => {
    const client = yelp.client(response.jsonBody.access_token);

    client.search(searchRequest).then(response => {
      console.log('Response: %j', response);

      const slackText = `I found *${response.jsonBody.total}* results for *${searchRequest.term}* near you. Here's a few of them:`;
      let slackAttachments = [];

      for (let business of response.jsonBody.businesses) {
        let attachment = {
          title: `${business.name}`,
          title_link: business.url.split('?')[0],
          color: 'danger',
          thumb_url: business.image_url,
          fields: [
            {
              title: 'Rating',
              value: business.rating,
              short: true
            },
            {
              title: 'Price',
              value: business.price,
              short: true
            }
          ]
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
};
