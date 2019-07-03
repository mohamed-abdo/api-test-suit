import pytest
import json
import logging
from utils.parse_json import JsonUtils


class TestCapture:

    @pytest.fixture
    def logging_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @pytest.fixture
    def json_file_path(self):
        return '.\\resources\\api-response\\CAPTURE_DEFAULT.json'

    @pytest.fixture
    def json_data(self, json_file_path):
        return JsonUtils(json_file_path).get_data()

    def test_ok_status_code(self, json_data):
        assert (json_data.status == 200), 'expected status code 200'
        assert (json_data.response.statusInfo.status ==
                'SUCCESS'), 'expected success in status info'

    def test_captured_amount_matched(self, json_data):
        actual = json_data.request.paymentInfo.amount
        expected = json_data.response.paymentInfo.amount
        assert (str(actual.value) == str(expected.value)
                ), 'capture amount is mismatched'
        assert (actual.currency ==
                expected.currency), 'capture currency is mismatched'

    @pytest.mark.parametrize('param_data', [JsonUtils('.\\resources\\api-response\\CAPTURE_INVLAID_BENE_AMOUNT.json').get_data()])
    def test_ok_status_code(self, param_data):
        assert (param_data.status == 400), 'expected status code 400'
        assert (param_data.response.statusInfo.status ==
                'FAILURE'), 'expected FAILURE in status info'
        assert (param_data.response.statusInfo.errorCode.code ==
                'AMOUNT_EXCEEDED'), 'expected FAILURE code in status info'
