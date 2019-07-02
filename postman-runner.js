const newman = require('newman');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const fs_extra = require('fs-extra');

const resourceDir = '.\\resources\\api-response';
const archiveDir = '.\\archive';

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
        if (err) {
            throw err;
        }
        console.log('collection run complete! ', _.get(summary, 'run.timings'));
    })
    .on('start', function (err, args) {
        archivePrevExecutionSync();
        createExecutionDir();
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
        writeRequest(requestBody.testCase, JSON.stringify(requestBody));
        postRequest(params.traceService, 'tracer', requestBody);
    })
    .on('error', function (err, summary) {
        if (err || summary.error) {
            console.error('collection run encountered an error.');
        } else {
            postRequest(params.traceService, 'summary', summary);
            console.log('collection run completed.');
        }
    })
    .on('done', function (err, summary) {
        if (err || summary.error) {
            console.error('collection run encountered an error.');
        } else {
            postRequest(params.traceService, 'summary', summary);
            console.log('collection run completed.');
        }
    });

const postRequest = function (traceService, endpoint, requestBody) {
    const traceServiceEndpoint = `${traceService}/${endpoint}/${requestBody.id}`;
    console.log(`on request:${requestBody.testCase}, calling: ${traceServiceEndpoint} service`);
    request.post(traceServiceEndpoint, {
        json: {
            data: requestBody
        }
    }, (error, res, body) => {
        if (error) {
            console.error(`error on while sending tarce to ${traceService}, test case: ${requestBody.testCase}, error: ${error}`)
            return
        }
        console.log(`statusCode: ${res.statusCode}, for test case: ${requestBody.testCase}`)
    });
};

const defaultCallbacl = function (err) {
    if (err)
        console.error(err);
};


const writeRequest = function (testCase, json) {
    fs_extra.writeFile(`${resourceDir}\\${testCase}.json`, json, defaultCallbacl);
};

const createExecutionDir = function () {
    if (!fs.existsSync(resourceDir))
        fs.mkdirSync(resourceDir, {
            recursive: true
        }, defaultCallbacl);
}
const archivePrevExecutionSync = function () {
    fs.readdir(resourceDir, {
        withFileTypes: true
    }, (err, files) => {
        if (err)
            console.error(err);
        else
            files.forEach(file => {
                const folderName = +new Date();
                console.info(`moving directory: ${file.name} to ${archiveDir}\\${folderName}\\${file.name}`);
                fs_extra.moveSync(`${resourceDir}\\${file.name}`, `${archiveDir}\\${folderName}\\${file.name}`);
            });
    });
};