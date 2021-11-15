// wipe out the current credentials by setting empty ones, ones set here override all else
const aws = require('aws-sdk');
const credentialsObject = {};
aws.config.update({ credentials: credentialsObject });
if (credentialsObject !== aws.config.credentials || JSON.stringify(credentialsObject) !== '{}') {
  throw Error.create('AWSCredentialsOverrideBroken');
}