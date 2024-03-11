const DynamoDbOriginal = require('aws-sdk/clients/dynamodb');

process.env.AWS_NODEJS_CONNECTION_REUSE_ENABLED = 1;

const DynamoDbError = require('./dynamoDbError');

// https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.DELETE
function parseExpression(logger, expression, isMultiExpression) {
  const orderedTokens = (expression || '').trim().split(' ').filter(token => token).map(token => token.trim());

  let currentExpressionCounter = isMultiExpression ? -1 : 0;
  const partialExpressions = [];
  for (const token of orderedTokens) {
    if (token.match(/^(DELETE|ADD|SET|REMOVE)$/i)) {
      currentExpressionCounter++;
    }
    partialExpressions[currentExpressionCounter] = `${partialExpressions[currentExpressionCounter] || ''} ${token}`.trim();
  }

  if (currentExpressionCounter === -1) {
    throw new DynamoDbError({
      title: 'Invalid Expression: the expression does not match a valid DynamoDB expression: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html', expression
    }, 'InvalidExpression');
  }

  return { keys: {}, values: {} };
}
class DynamoDB extends DynamoDbOriginal.DocumentClient {
  constructor(args) {
    super(args);
    this.logger = args && args.logger || (() => {});
  }

  get(originalParams) {
    if (!originalParams || !originalParams.TableName) { throw new DynamoDbError({ error: 'TableName not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.Key) { throw new DynamoDbError({ error: 'Key not specified', parameters: originalParams }, 'InvalidParameters'); }

    const params = originalParams;
    const capturedStack = { name: 'DynamoDB.update() Error:' };
    Error.captureStackTrace(capturedStack);
    const resultAsync = super.get(params).promise().catch(error => {
      const wrappedError = new DynamoDbError({ message: error.message, method: 'Get', parameters: originalParams, dynamoDbStack: error.stack }, error.code);
      wrappedError.stack = capturedStack;
      throw wrappedError;
    });
    resultAsync.promise = () => resultAsync;
    // Prevent unhandled promise rejections
    resultAsync.catch(() => {});
    return resultAsync;
  }

  query(originalParams) {
    if (!originalParams || !originalParams.TableName) { throw new DynamoDbError({ error: 'TableName not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.KeyConditionExpression) { throw new DynamoDbError({ error: 'KeyConditionExpression not specified', parameters: originalParams }, 'InvalidParameters'); }

    const params = originalParams;
    const capturedStack = { name: 'DynamoDB.update() Error:' };
    Error.captureStackTrace(capturedStack);
    const resultAsync = super.query(params).promise().catch(error => {
      const wrappedError = new DynamoDbError({ message: error.message, method: 'Query', parameters: originalParams, dynamoDbStack: error.stack }, error.code);
      wrappedError.stack = capturedStack;
      throw wrappedError;
    });
    resultAsync.promise = () => resultAsync;
    // Prevent unhandled promise rejections
    resultAsync.catch(() => {});
    return resultAsync;
  }

  delete(originalParams) {
    if (!originalParams || !originalParams.TableName) { throw new DynamoDbError({ error: 'TableName not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.Key) { throw new DynamoDbError({ error: 'Key not specified', parameters: originalParams }, 'InvalidParameters'); }

    const conditionExpressionTokens = parseExpression(this.logger, originalParams.ConditionExpression);
    if (conditionExpressionTokens) {
      // Validate the tokens
    }

    const params = originalParams;
    const capturedStack = { name: 'DynamoDB.update() Error:' };
    Error.captureStackTrace(capturedStack);
    const resultAsync = super.delete(params).promise().catch(error => {
      const wrappedError = new DynamoDbError({ message: error.message, method: 'Delete', parameters: originalParams, dynamoDbStack: error.stack }, error.code);
      wrappedError.stack = capturedStack;
      throw wrappedError;
    });
    resultAsync.promise = () => resultAsync;
    // Prevent unhandled promise rejections
    resultAsync.catch(() => {});
    return resultAsync;
  }

  put(originalParams) {
    if (!originalParams || !originalParams.TableName) { throw new DynamoDbError({ error: 'TableName not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.Item) { throw new DynamoDbError({ error: 'Item not specified', parameters: originalParams }, 'InvalidParameters'); }

    const conditionExpressionTokens = parseExpression(this.logger, originalParams.ConditionExpression);
    if (conditionExpressionTokens) {
      // Validate the tokens
    }

    const params = originalParams;
    const capturedStack = { name: 'DynamoDB.update() Error:' };
    Error.captureStackTrace(capturedStack);
    const resultAsync = super.put(params).promise().catch(error => {
      const wrappedError = new DynamoDbError({ message: error.message, method: 'Put', parameters: originalParams, dynamoDbStack: error.stack }, error.code);
      wrappedError.stack = capturedStack;
      throw wrappedError;
    });
    resultAsync.promise = () => resultAsync;
    // Prevent unhandled promise rejections
    resultAsync.catch(() => {});
    return resultAsync;
  }

  scan(originalParams) {
    if (!originalParams || !originalParams.TableName) { throw new DynamoDbError({ error: 'TableName not specified', parameters: originalParams }, 'InvalidParameters'); }

    const params = originalParams;
    const capturedStack = { name: 'DynamoDB.update() Error:' };
    Error.captureStackTrace(capturedStack);
    const resultAsync = super.scan(params).promise().catch(error => {
      const wrappedError = new DynamoDbError({ message: error.message, method: 'Scan', parameters: originalParams, dynamoDbStack: error.stack }, error.code);
      wrappedError.stack = capturedStack;
      throw wrappedError;
    });
    resultAsync.promise = () => resultAsync;
    // Prevent unhandled promise rejections
    resultAsync.catch(() => {});
    return resultAsync;
  }

  update(originalParams) {
    if (!originalParams || !originalParams.TableName) { throw new DynamoDbError({ error: 'TableName not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.Key) { throw new DynamoDbError({ error: 'Key not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.UpdateExpression) { throw new DynamoDbError({ error: 'UpdateExpression not specified', parameters: originalParams }, 'InvalidParameters'); }

    // update, put related
    const updateExpressionTokens = parseExpression(this.logger, originalParams.UpdateExpression, true);
    const conditionExpressionTokens = parseExpression(this.logger, originalParams.ConditionExpression);
    if (updateExpressionTokens || conditionExpressionTokens) {
      // Validate the tokens
    }

    const params = originalParams;
    const capturedStack = { name: 'DynamoDB.update() Error:' };
    Error.captureStackTrace(capturedStack);
    const resultAsync = super.update(params).promise().catch(error => {
      const wrappedError = new DynamoDbError({ message: error.message, method: 'Update', parameters: originalParams, dynamoDbStack: error.stack }, error.code);
      wrappedError.stack = capturedStack;
      throw wrappedError;
    });
    resultAsync.promise = () => resultAsync;
    // Prevent unhandled promise rejections
    resultAsync.catch(() => {});
    return resultAsync;
  }
}

module.exports = { DynamoDB };
