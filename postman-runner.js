const newman = require('newman');
const _ = require('lodash');
const request = require('request');
const fs = require('fs');
const fs_extra = require('fs-extra');
const prettyJson = require('prettyjson');


const postmanRunnner = function (params) {
    try {
        newman.run({
                collection: require(params.collection),
                environment: require(params.environment),
                reporters: 'cli'
            })
            .on('start', function (err, args) {
                createExecutionDir(params.resourceDir, params.executionId);
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
                writeRequest(params.resourceDir, params.executionId, requestBody.testCase, JSON.stringify(requestBody));
                postRequest(params.traceService, 'tracer', params.executionId, requestBody);
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
                    postRequest(params.traceService, 'summary', params.executionId, requestBody).then((res) => {
                        archivePrevExecutionSync(params.resourceDir, params.executionId, params.archiveDir);
                    });
                    console.log(`collection run completed, execution summary: \n ${prettyJson.render(requestBody)}`);
                }
            });
    } catch (err) {
        console.error(`error while executing postman collection, ${err}`)
    }
};

const postRequest = function (traceService, endpoint, executionId, requestBody) {
    const traceServiceEndpoint = `${traceService}/${endpoint}/${executionId}`;
    console.log(`on request:${requestBody.testCase}, calling: ${traceServiceEndpoint} service`);
    return new Promise((resolve, reject) => {
        request.post(traceServiceEndpoint, {
            json: {
                data: requestBody
            }
        }, (err, res) => {
            if (err) {
                console.error(`error on while sending tarce to ${traceServiceEndpoint}, error: ${err}`)
                return reject(err);
            }
            console.log(`successfully get response of service: ${traceServiceEndpoint}`)
            resolve(res);
        });
    });
};

const defaultCallbacl = function (err) {
    if (err)
        console.error(err);
};


const writeRequest = function (resourceDir, executionId, testCase, json) {
    fs_extra.writeFile(`${resourceDir}\\${executionId}\\${testCase}.json`, json, defaultCallbacl);
};

const createExecutionDir = function (resourceDir, executionId) {
    fs.mkdirSync(`${resourceDir}\\${executionId}`, {
        recursive: true
    }, defaultCallbacl);
}
const archivePrevExecutionSync = function (resourceDir, executionId, archiveDir) {
    console.log(`archiving: ${resourceDir}\\${executionId}`);
    fs_extra.moveSync(`${resourceDir}\\${executionId}`, `${archiveDir}\\${executionId}`);
};

// executing postman runner
const params = {
    traceService: process.argv[2],
    collection: process.argv[3],
    environment: process.argv[4],
    resourceDir: '.\\resources',
    archiveDir: '.\\archive',
    executionId: +new Date()
}

fs.lstat(params.collection, (err, stats) => {
    if (err) {
        console.error(err);
        return;
    }
    if (!stats.isDirectory()) {
        postmanRunnner(params);
    } else {
        fs.readdir(params.collection, {
            withFileTypes: true
        }, (err, pathes) => {
            if (err) {
                console.error(err);
                return;
            }
            pathes
                .filter(p => !p.isDirectory())
                .forEach(f => {
                    params.collection = f.name;
                    params.executionId = +new Date();
                    postmanRunnner(params);
                });
        });
    }
});