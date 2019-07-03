import pytest
import json
import logging
from utils.parse_json import ParseJson


class TestAuth:

    @pytest.fixture
    def logging_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @pytest.fixture
    def json_file_path(self):
        self.json_file_path = '.\\resources\\api-response\\AUTH_REQ_V2.json'

    @pytest.fixture
    def json_data(self, json_file_path):
        with open(self.json_file_path, 'r') as f:
            data_dic = json.loads(f.read())
            return ParseJson(data_dic)

    def test_ok_status_code(self, json_data):
        assert (json_data.status == 200), 'expected status code 200'
