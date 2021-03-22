const { MeterProvider } = require('@opentelemetry/metrics')

const { DiagConsoleLogger, DiagLogLevel, diag } = require('@opentelemetry/api')
const { CollectorMetricExporter } = require('@opentelemetry/exporter-collector-grpc')

// Optional and only needed to see the internal diagnostic logging (during development)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);


const metricExporter = new CollectorMetricExporter({
    serviceName: 'aws-otel-js-sample',
    url: (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) ? process.env.OTEL_EXPORTER_OTLP_ENDPOINT : "localhost:55680"
  })

const meter = new MeterProvider({
    exporter: metricExporter,
    interval: 1000,
}).getMeter('aws-otel-js')


const requestCount = meter.createCounter('payload', {
    description: 'Metric for counting payload size'
})

const boundInstruments = new Map();

module.exports.countAllRequest = () => {
    return (req, res, next) => {
        if (!boundInstruments.has(req.path)) {
            const labels = { stage: process.req.stage }
            const boundCounter = requestCount.bind(labels)
            boundInstruments.set(req.path, boundCounter)
        }

        boundInstruments.get(req.path).add(1)
        next()
    }
}