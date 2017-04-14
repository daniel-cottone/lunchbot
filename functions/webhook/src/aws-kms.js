'use strict';
import aws from 'aws-sdk';
import 'babel-polyfill';

let awsKms = exports;

function getDecryptPromise(s, region) {
  const kms = new aws.KMS({ region: region });
  let params = {
    'CiphertextBlob': new Buffer(s, 'base64')
  };
  return kms.decrypt(params).promise();
}

awsKms.decrypt = function (props, region) {
  var promises = [];
  Object.keys(props).forEach(key => {
    promises.push(getDecryptPromise(props[key], region));
  });

  return Promise.all(promises).then(values => {
    var response = {};
    Object.keys(props).forEach((key, i) => {
      response[key] = values[i].Plaintext.toString();
    });
    return response;
  }).catch(error => {
    throw new Error(error);
  });
};
