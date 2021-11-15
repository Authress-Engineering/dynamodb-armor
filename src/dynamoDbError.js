class DynamoDbError extends Error {
  constructor(message, code, ...args) {
    super(message, ...args);
    if (typeof Error.captureStackTrace !== 'undefined') {
      Error.captureStackTrace(this, this.constructor);
    }
    this.message = message;
    this.code = code || (typeof message === 'string' ? message : null);
  }
  
  get [Symbol.toStringTag]() {
    return this.toString();
  }
  
  toString() {
    const codeString = this.code ? ` (${this.code})` : '';
    return this.message ? `${this.constructor.name}${codeString}: ${JSON.stringify(this.message)}` : this.constructor.name;
  }
  
  toJSON() {
    let map = {};
    Object.getOwnPropertyNames(this).forEach(key => {
      map[key] = this[key];
    });
    return map;
  }
}

module.exports = DynamoDbError;
  
