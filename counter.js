const { MeterProvider } = require('@opentelemetry/metrics')



const meter = new MeterProvider({
    interval: 1000,
}).getMeter('meter-example')


const requestCount = meter.createCounter('requests', {
    description: 'Count all incoming requests'
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