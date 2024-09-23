const { expect } = require('chai');
const { describe, it, beforeEach, afterEach } = require('mocha');
const sinon = require('sinon');
const { DynamoDB: DynamoDbOriginal } = require('aws-sdk');

let sandbox;
beforeEach(() => { sandbox = sinon.createSandbox(); });
afterEach(() => sandbox.restore());

const { DynamoDB } = require('../src/dynamoDbSafe');
const cloneDeep = require('lodash.clonedeep');

describe('dynamoDbArmor.js', () => {
  describe('namesAndValuesCoercion()', () => {
    it('Fixes undefined expressionAttributeValue - Coerce `undefined` expression attribute values to `null`, because dynamoDb cant handle them, and it strips them from the request. nulls are not stripped', async () => {
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
          ':value': undefined
        }
      };
      try {
        const dynamoDbOriginalMock = sandbox.mock(DynamoDbOriginal.DocumentClient.prototype);

        const expectedParams = cloneDeep(params);
        expectedParams.ExpressionAttributeValues[':value'] = null;
        dynamoDbOriginalMock.expects('update').once().withArgs(expectedParams).returns({ promise() { return Promise.resolve(); } });
        await new DynamoDB().update(params);
        dynamoDbOriginalMock.verify();
      } catch (error) {
        expect(error.message).to.eql(null, JSON.stringify(error.message, null, 2));
      }
    });
  });
});
