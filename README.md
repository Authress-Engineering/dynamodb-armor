# dynamodb-armor
Drop in replacement for DynamoDB, 100% compatible, protects against common production problems.

## Setup
* `npm i --save dynamodb-armor`
* Use the builtin client instead of the one from the AWS SDK.

```js
const { DynamoDB } = require('dynamodb-armor');

const dynamoDbClient = new DynamoDB.DocumentClient({});
const params = {
  TableName: dynamoDbTable,
  Key: {
    hash: 'HashValue',
    range: 'RangeValue'
  },
  UpdateExpression: 'set #key = :value',
  ConditionExpression: 'attribute_exists(hash)',
  ExpressionAttributeNames: {
    '#key': 'key'
  },
  ExpressionAttributeValues: {
    ':value': value
  }
};

await dynamoDbClient.update(params); // That's right you don't even need the .promise() anymore, or leave it in if you feel like it
```

## Here's all the things you don't need to think about

![DynamoDB Armor is the best](./docs/all-the-things.png)

* Drop in replacement for DynamoDB 100% compatible, but it comes with full protection
* No missing `promises()` always get an async promise back
* Don't worry about extra expression attributes names or values
* Don't worry about forgetting to substitute values into the expressions
* Errors always contain parameters and complete documentation of the actual problem, so confusing stack traces or questioning where or why the error happened
* Test mode to easily validate dynamoDB requests in unit tests to ensure the configuration is correct.
* Automatic configuration for best practices from AWS DynamoDB