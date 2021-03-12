'use strict';

const { countAllRequest } = require('./counter')

module.exports.hello = async (event) => {
  console.log('Calling counter')
  countAllRequest()
  console.log('Counter called')
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
