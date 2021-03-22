'use strict'

const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api')
const { SimpleSpanProcessor, ConsoleSpanExporter } = require("@opentelemetry/tracing");
const { NodeTracerProvider } = require('@opentelemetry/node');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector-grpc');

const { AWSXRayPropagator } = require('@aws/otel-aws-xray-propagator');
const { AwsXRayIdGenerator } = require('@aws/otel-aws-xray-id-generator');

const { propagation, trace } = require("@opentelemetry/api");

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

module.exports = (serviceName) => {
  // set global propagator
  propagation.setGlobalPropagator(new AWSXRayPropagator());

  // create a provider for activating and tracking with AWS IdGenerator
  const tracerConfig = {
    idGenerator: new AwsXRayIdGenerator(),
    plugins: {
      https: {
        enabled: true,
        // You may use a package name or absolute path to the file.
        path: '@opentelemetry/plugin-https',
        // https plugin options
      },
      "aws-sdk": {
        enabled: true,
        // You may use a package name or absolute path to the file.
        path: "opentelemetry-plugin-aws-sdk",
      },
    },
  };
  const tracerProvider = new NodeTracerProvider(tracerConfig);
  
  // add OTLP exporter
  const otlpExporter = new CollectorTraceExporter({
    serviceName: serviceName,
    url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) ? process.env.OTEL_EXPORTER_OTLP_ENDPOINT : "localhost:55680"
  });
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(otlpExporter));
  tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  // Register the tracer
  tracerProvider.register();

  // Return an tracer instance
  return trace.getTracer("awsxray-tests");
}