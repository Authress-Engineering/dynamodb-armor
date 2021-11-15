const { describe, it, beforeEach, afterEach } = require('mocha');
const { expect } = require('chai');
const sinon = require('sinon');

let sandbox;
beforeEach(() => { sandbox = sinon.sandbox.create(); });
afterEach(() => sandbox.restore());

const { DynamoDB } = require('../src/dynamoDbSafe');

describe.only('dynamoDbArmor.js', () => {
  describe('expressionValidation()', () => {
    it('Validate single SET', () => {
      const result = new DynamoDB().parseExpression('SET #key = :value');
    });
  });
});
