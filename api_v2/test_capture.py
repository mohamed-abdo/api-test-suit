import pytest
import json
import logging
from utils.parse_json import ParseJson


class TestCapture:

    @pytest.fixture
    def logging_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @pytest.fixture
    def json_file_path(self):
        self.json_file_path = '.\\resources\\api-response\\CAPTURE_REQ_V2.json'

    @pytest.fixture
    def json_data(self, json_file_path):
        with open(self.json_file_path, 'r') as f:
            data_dic = json.loads(f.read())
            return ParseJson(data_dic)

    def test_ok_status_code(self, json_data):
        assert (json_data.status == 200), 'expected status code 200'
        assert (json_data.response.statusInfo.status ==
                'SUCCESS'), 'expected success in status info'

    def test_captured_amount_matched(self, json_data):
        actual = json_data.request.paymentInfo.amount
        expected = json_data.response.paymentInfo.amount
        assert (str(actual.value) == str(expected.value)), 'capture amount is mismatched'
        assert (actual.currency ==
                expected.currency), 'capture currency is mismatched'
