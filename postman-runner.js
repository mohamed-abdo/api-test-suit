const newman = require('newman');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const fs_extra = require('fs-extra');
const prettyJson = require('prettyjson');

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
                    request: JSON.parse(args.request.body.raw),
                    response: !!args.response.body ? JSON.parse(args.response.body.raw) : JSON.parse(args.response.stream),
                }
                writeRequest(params.resourceDir, requestBody.testCase, JSON.stringify(requestBody));
                postRequest(params.executionId, params.traceService, 'tracer', requestBody);
            })
            .on('done', function (err, summary) {
                if (err || summary.error) {
                    console.error('collection run encountered an error.');
                } else {
                    let requestBody = {};
                    if (!!(summary.run)) {
                        let status_dic = {};
                        summary.run.executions
                            .map(r => [r.request.url.path.join('/'), r.response.code])
                            .map(i => status_dic[i[0]] = i[1]);
                        requestBody = {
                            requests: status_dic,
                            timings: summary.run.timings
                        }
                    }
                    postRequest(summary.collection.name, params.traceService, 'summary', requestBody);
                    console.log(`collection run completed, execution summary: \n ${prettyJson.render(requestBody)}`);
                }
            });
    } catch (err) {
        console.error(`error while executing postman collection, ${err}`)
    }
};

const postRequest = function (executionId, traceService, endpoint, requestBody) {
    const traceServiceEndpoint = `${traceService}/${endpoint}/${executionId}`;
    console.log(`on request:${requestBody.testCase}, calling: ${traceServiceEndpoint} service`);
    request.post(traceServiceEndpoint, {
        json: {
            data: requestBody
        }
    }, (err, res) => {
        if (err) {
            console.error(`error on while sending tarce to ${traceServiceEndpoint}, error: ${err}`)
            return
        }
        console.log(`successfully get response of service: ${traceServiceEndpoint}`)
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
                fs_extra.moveSync(`${resourceDir}\\${file.name}`, `${archiveDir}\\${executionId}\\${file.name}`);
            });
    });
};

// executing postman runner
postmanRunnner(params);