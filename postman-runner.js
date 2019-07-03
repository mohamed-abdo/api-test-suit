const newman = require('newman');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const fs_extra = require('fs-extra');

const params = {
    traceService: process.argv[2],
    collection: process.argv[3],
    environment: process.argv[4],
    resourceDir: '.\\resources\\api-response',
    archiveDir: '.\\archive',
    executionId: +new Date()
}

const postmanRunnner = function (params) {
    try {
        newman.run({
                collection: require(params.collection),
                environment: require(params.environment),
                reporters: 'cli'
            }, function (err, summary) {
                if (err) {
                    throw err;
                }
                console.log('collection run complete! ', _.get(summary, 'run.timings'));
            })
            .on('start', function (err, args) {
                archivePrevExecutionSync(params.resourceDir, params.archiveDir, params.executionId);
                createExecutionDir(params.resourceDir);
                console.log('on start ...');
            })
            .on('request', function (err, args) {
                const requestBody = {
                    testCase: args.item.name,
                    status: args.response.code,
                    response_time: args.response.responseTime,
                    headers: _.fromPairs(args.request.headers.members.map(v => [v.key, v.value])),
                    request: args.request.body.raw,
                    response: _.get(args, 'response.body.raw'),
                }
                writeRequest(params.resourceDir, requestBody.testCase, JSON.stringify(requestBody));
                postRequest(params.resourceDir, params.traceService, 'tracer', requestBody);
            })
            .on('done', function (err, summary) {
                if (err || summary.error) {
                    console.error('collection run encountered an error.');
                } else {
                    postRequest(params.traceService, 'summary', summary);
                    console.log('collection run completed.');
                }
            });
    } catch (err) {
        console.error(`error while executing postman collection, ${err}`)
    }
};

const postRequest = function (traceService, endpoint, requestBody) {
    const traceServiceEndpoint = `${traceService}/${endpoint}/${executionId}`;
    console.log(`on request:${requestBody.testCase}, calling: ${traceServiceEndpoint} service`);
    request.post(traceServiceEndpoint, {
        json: {
            data: requestBody
        }
    }, (error, res) => {
        if (error) {
            console.error(`error on while sending tarce to ${traceService}, error: ${error}`)
            return
        }
        console.log(`statusCode: ${res.statusCode}, of service: ${traceService}`)
    });
};

const defaultCallbacl = function (err) {
    if (err)
        console.error(err);
};


const writeRequest = function (resourceDir, testCase, json) {
    fs_extra.writeFile(`${resourceDir}\\${testCase}.json`, json, defaultCallbacl);
};

const createExecutionDir = function (resourceDir) {
    if (!fs.existsSync(resourceDir))
        fs.mkdirSync(resourceDir, {
            recursive: true
        }, defaultCallbacl);
}
const archivePrevExecutionSync = function (resourceDir, archiveDir, executionId) {
    fs.readdir(resourceDir, {
        withFileTypes: true
    }, (err, files) => {
        if (err)
            console.error(err);
        else
            files.forEach(file => {

                console.info(`moving directory: ${file.name} to ${archiveDir}\\${executionId}\\${file.name}`);
                fs_extra.moveSync(`${resourceDir}\\${file.name}`, `${archiveDir}\\${executionId}\\${file.name}`);
            });
    });
};

// executing postman runner
postmanRunnner(params);