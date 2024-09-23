# Change log

## 1.0 ##
* Coerce `undefined` expression attribute values to `null`, because dynamoDb can't handle that, and it strips them from the request