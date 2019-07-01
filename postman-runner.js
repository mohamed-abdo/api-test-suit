const newman = require('newman');
const _ = require('lodash');
const request = require('request')

const params = {
    traceService: process.argv[2],
    collection: process.argv[3],
    environment: process.argv[4]
}

newman.run({
    collection: require(params.collection),
    environment: require(params.environment),
    reporters: 'cli'
}, function (err, summary) {
    if (err) { throw err; }
    console.log('collection run complete! ', _.get(summary, 'run.timings'));
})
    .on('start', function (err, args) {
        console.log('on start ...');
    })
    .on('request', function (err, args) {
        const req = {
            testCase: args.item.name,
            status: args.response.code,
            response_time: args.response.responseTime,
            headers: _.get(args, 'request.headers.members'),
            request: _.get(args, 'request.body.raw'),
            response: _.get(args, 'response.body.raw'),
        }
        postRequest(params.traceService, req);
    })
    .on('done', function (err, summary) {
        if (err || summary.error) {
            console.error('collection run encountered an error.');
        }
        else {
            console.log('collection run completed.');
        }
    });

const postRequest = function (traceService, requestData) {
    const traceServiceEndpoint = `${traceService}/${requestData.testCase}`;
    console.log(`on request:${requestData.testCase}, calling tracing service: ${traceServiceEndpoint}`);
    request.post(traceServiceEndpoint, {
        json: {
            data: requestData
        }
    }, (error, res, body) => {
        if (error) {
            console.error(`error on while sending tarce to ${traceService}, test case: ${requestData.testCase}, error: ${error}`)
            return
        }
        console.log(`statusCode: ${res.statusCode}, for test case: ${requestData.testCase}`)
    });
};