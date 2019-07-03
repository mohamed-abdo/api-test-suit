import pytest
import json
import logging
from utils.parse_json import JsonUtils


class TestAuth:

    @pytest.fixture
    def logging_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @pytest.fixture
    def json_file_path(self):
        return '.\\resources\\api-response\\AUTH_DEFAULT.json'

    @pytest.fixture
    def json_data(self, json_file_path):
        return JsonUtils(json_file_path).get_data()

    def test_ok_status_code(self, json_data):
        assert (json_data.status == 200), 'expected status code 200'
