'use strict';

const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api')
const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector-grpc');
const { MeterProvider } = require('@opentelemetry/metrics');

const API_COUNTER_METRIC = 'apiBytesSent';
const API_LATENCY_METRIC = 'latency';

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

/** The OTLP Metrics gRPC Collector */
const metricExporter = new CollectorMetricExporter({
    serviceName: process.env.OTEL_RESOURCE_ATTRIBUTES ? process.env.OTEL_RESOURCE_ATTRIBUTES : 'aws-otel-integ-test',
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ? process.env.OTEL_EXPORTER_OTLP_ENDPOINT : 'localhost:55680'
});

/** The OTLP Metrics Provider with OTLP gRPC Metric Exporter and Metrics collection Interval  */
const meter = new MeterProvider({
    exporter: metricExporter,
    interval: 1000,
}).getMeter('aws-otel');

/**  grabs instanceId and append to metric name to check individual metric for integration test */
const latencyMetricName = API_LATENCY_METRIC;
const  apiBytesSentMetricName = API_COUNTER_METRIC;
// const instanceId = process.env.INSTANCE_ID || '';
// if (instanceId && instanceId.trim() !== '') {
//     latencyMetricName += '_' + instanceId;
//     apiBytesSentMetricName += '_' + instanceId;
// }

/** Counter Metrics */
const payloadMetric = meter.createCounter(apiBytesSentMetricName, {
    description: 'Metric for counting request payload size',
});

/** Value Recorder Metrics with Histogram */
const requestLatency = meter.createValueRecorder(latencyMetricName, {
    description: 'Metric for record request latency'
});

//** binds request latency metric with returnTime */
const emitReturnTimeMetric = (returnTime, apiName, statusCode) => {
    console.log('emit metric with return time ' + returnTime + ', ' + apiName + ', ' + statusCode);
    const labels = { 'apiName': apiName, 'statusCode': statusCode };
    requestLatency.bind(labels).record(returnTime);
}

//** emitsPayLoadMetrics() Binds payload Metric with number of bytes */
const emitsPayloadMetric = (bytes, apiName, statusCode) => {
    console.log('emit metric with http request size ' + bytes + ' byte, ' + apiName);
    const labels = { 'apiName': apiName, 'statusCode': statusCode };
    payloadMetric.bind(labels).add(bytes);
}

module.exports = {
    emitReturnTimeMetric: emitReturnTimeMetric,
    emitsPayloadMetric: emitsPayloadMetric
}