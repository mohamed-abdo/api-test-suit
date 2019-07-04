import pytest
import json
import logging
import os
from utils.parse_json import TestUtils


class TestAuth:

    @pytest.fixture
    def logging_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @pytest.fixture
    def json_file_path(self):
        return '.\\resources\\api-response\\AUTH_DEFAULT.json'

    @pytest.fixture(autouse=True)
    def json_data(self, json_file_path):
        if not os.path.exists(json_file_path):
            pytest.skip()
            return None
        return TestUtils.get_data(json_file_path)

    def test_ok_status_code(self, json_data):
        assert (json_data.status == 200), 'expected status code 200'
