const { expect } = require('chai');
const { describe, it, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');
const { DynamoDB: DynamoDbOriginal } = require('aws-sdk');

let sandbox;
beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(() => sandbox.restore());

const { DynamoDB } = require('../src/dynamoDbSafe');

describe('dynamoDbArmor.js', () => {
  describe('expressionValidation()', () => {
    it('Validate single SET', async () => {
      const testTable = 'Test-TableId';
      const testHash = 'testHash';
      const testRange = 'testRange';
      const params = {
        TableName: testTable,
        Key: {
          hash: testHash,
          rang: testRange
        },
        UpdateExpression: 'SET #key = :value',
        ConditionExpression: 'attribute_exists(hash)',
        ExpressionAttributeNames: {
          '#key': 'key'
        },
        ExpressionAttributeValues: {
          ':value': 'value'
        }
      };
      try {
        const dynamoDbOriginalMock = sandbox.mock(DynamoDbOriginal.DocumentClient.prototype);
        dynamoDbOriginalMock.expects('update').once().returns({ promise() { return Promise.resolve(); } });
        await new DynamoDB().update(params);
        dynamoDbOriginalMock.verify();
      } catch (error) {
        expect(error.message).to.eql(null, JSON.stringify(error.message, null, 2));
      }
    });
  });
});
