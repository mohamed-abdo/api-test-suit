from flask import Flask, request, url_for, Response, jsonify, json
import pytest

import logging
from datetime import datetime

app = Flask(__name__)

pytestDir = '.\\api_v2'


@app.route("/", methods=['GET'])
def index():
    return "ok!"


@app.route("/tracer/<string:testCase>", methods=['POST'])
def tracer(testCase):
    now = datetime.now()
    formatted_now = now.strftime("%A, %d %B, %Y at %X")
    print('tracing of testCase: {}, at:{}'.format(testCase, formatted_now))
    response = Response()
    response.headers = {'content-type': 'application/json',
                        'Accept': 'application/json'}
    response.headers = {**request.headers}
    try:
        if request.is_json:
            payload = request.get_json()
            response.data = json.dumps(payload)
    except Exception as ex:
        logging.error('error of tracer: {}'.format(ex))
    return response, 200


@app.route("/summary/<string:executionId>", methods=['POST'])
def initiateUnitTest(executionId):
    now = datetime.now()
    formatted_now = now.strftime("%A, %d %B, %Y at %X")
    print('tracing of testCase: {}, at:{}'.format(executionId, formatted_now))
    response = Response()
    response.headers = {'content-type': 'application/json',
                        'Accept': 'application/json'}
    response.headers = {**request.headers}
    try:
        if request.is_json:
            payload = request.get_json()
            response.data = json.dumps(payload)
        # run pytest from pytest defined directory
        pytest.main(
            ['-x', pytestDir, '--html=.\\reports\\{}-report.html'.format(executionId)])
    except Exception as ex:
        logging.error('error of tracer: {}'.format(ex))
    return response, 200


with app.test_request_context():
    print(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
