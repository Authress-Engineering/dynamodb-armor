const { DynamoDB: DynamoDbOriginal } = require('aws-sdk');

const DynamoDbError = require('./dynamoDbError');
/**
 * Drop in replacement for DynamoDB 100% compatible, but it comes with full protection
 * No missing `promises()` always get an async promise back
 * Don't worry about extra expression attributes names or values
 * Don't worry about forgetting to substitute values into the expressions
 * Errors always contain parameters and complete documentation of the actual problem, so confusing stack traces or questioning where or why the error happened
 * Test mode to easily validate dynamoDB requests in unit tests to ensure the configuration is correct.
 */

// DynamoDB-Armor
class DynamoDB extends DynamoDbOriginal.DocumentClient {
  constructor(args) {
    super(args);
    this.logger = args && args.logger || (() => {});
  }

  // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.DELETE
  parseExpression(expression) {
    const orderedTokens = (expression || '').trim().split(' ').filter(token => token).map(token => token.trim());

    let currentExpressionCounter = -1;
    const partialExpressions = [];
    for (const token of orderedTokens) {
      if (token.match(/^(DELETE|ADD|SET|REMOVE)$/i)) {
        currentExpressionCounter++;
      }
      partialExpressions[currentExpressionCounter] += ` ${token}`;
    }

    if (currentExpressionCounter === -1) {
      this.logger({ code: 'InvalidExpression', expression });
      throw new DynamoDbError({
        title: 'Invalid Expression: the expression does not match a valid DynamoDB expression: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html', expression
      }, 'InvalidExpression');
    }

    // TODO: merge together repeated actions since DDB doesn't accept "SET operand SET operand"

    const setExpression = partialExpressions.find(e => e.match(/^SET/i));
    if (setExpression) {

    }

    const isValidKey = operand => operand.match(/^#\w+(\.#\w)*$/);
    const isValidOperand = operand => operand.match(/^:\w+$/) || operand.match(/^(#\w+(\.#\w)*|:\w+)[-+](#\w+(\.#\w)*|:\w+)$/);
    
    const arrayIterator = orderedTokens[Symbol.iterator]();
    let result;
    
    while ((result = arrayIterator.next()) && !result.done) {
      const token = result.value;
      if (token.match(/^SET$/i)) {
        const key = arrayIterator.next().value;
        const equalSign = arrayIterator.next().value;
        const operand = arrayIterator.next().value;

        if (!isValidKey(key) || equalSign !== '=' || !isValidOperand(operand)) {
          this.logger({ code: 'InvalidExpression', expression });
          throw new DynamoDbError({
            title: 'Invalid Expression: the expression does not match what DynamoDB expects: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html', expression,
            tokens: [key, equalSign, operand]
          }, 'InvalidExpression');
        }
      }
      
      console.log(token);
      
      // this.parseExpressionRecursive(token, orderedTokens);
    }

    return { keys: {}, values: {} };
  }
  // get
  // query
  // delete
  // put

  update(originalParams) {
    if (!originalParams || !originalParams.TableName) { throw new DynamoDbError({ error: 'TableName not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.Key) { throw new DynamoDbError({ error: 'Key not specified', parameters: originalParams }, 'InvalidParameters'); }
    if (!originalParams.UpdateExpression) { throw new DynamoDbError({ error: 'UpdateExpression not specified', parameters: originalParams }, 'InvalidParameters'); }

    // update, put related
    const updateExpressionTokens = this.parseExpression(originalParams.UpdateExpression);
    const conditionExpressionTokens = this.parseExpression(originalParams.ConditionExpression);
    
    // query related
    // const keyExpressionTokens = parseExpression(originalParams.KeyConditionExpression);
    // const filterExpressionTokens = parseExpression(originalParams.FilterExpression);
    // const matchingFilterExpressionKey = Object.keys(filterExpressionTokens.keys).some(filterKey => Object.keys(keyExpressionTokens.keys)
    // .some(keyKey => originalParams.ExpressionAttributeNames[keyKey] === originalParams.ExpressionAttributeNames[filterKey]));
    
    // // TODO: convert this from a error generation to in memory filtering
    // if (matchingFilterExpressionKey) {
    //   throw new DynamoDbError({ title: 'DynamoDB disallows having a FilterExpression contain ', key: matchingFilterExpressionKey, parameters: originalParams }, 'InvalidExpression');
    // }

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
