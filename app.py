from flask import Flask, request, url_for, Response, jsonify, json
from datetime import datetime

app = Flask(__name__)


@app.route("/", methods=['GET'])
def index():
    return "ok!"


@app.route("/tracer/<string:testCase>", methods=['POST'])
def trace(testCase):
    now = datetime.now()
    formatted_now = now.strftime("%A, %d %B, %Y at %X")
    print('tracing of testCase: {}, at:{}'.format(testCase, formatted_now))
    response = Response()
    response.headers = {'content-type': 'application/json',
                        'Accept': 'application/json'}
    response.headers = {**response.headers, **request.headers}
    if request.is_json:
        payload = request.get_json()
        response.data = json.dumps(payload)
    return response or 'n/a', 200


with app.test_request_context():
    print(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
