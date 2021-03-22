'use strict';

const tracer = require('./tracer')('aws-otel-integ-test');
const meter = require('./metric-emitter');
const AWS = require('aws-sdk');
const api = require('@opentelemetry/api');


module.exports.hello = async (event) => {
  console.log('Calling counter')
  const requestStartTime = new Date().getMilliseconds();
  const traceID = returnTraceIdJson()
  console.log('tracerId', traceID)
  const statusCode = 200
  meter.emitsPayloadMetric(mimicPayLoadSize(), '/outgoing-http-call', statusCode);
  meter.emitReturnTimeMetric(new Date().getMilliseconds() - requestStartTime, '/outgoing-http-call', statusCode);
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

const returnTraceIdJson = () => {
  const currentSpan = api.getSpan(api.context.active())
  const traceId = currentSpan.context.traceId;
  const xrayTraceId = "1-" + traceId.substring(0, 8) + "-" + traceId.substring(8);
  const traceIdJson = JSON.stringify({"traceId": xrayTraceId});
  return traceIdJson;
}

const mimicPayLoadSize = () => {
  return Math.random() * 1000;
}
