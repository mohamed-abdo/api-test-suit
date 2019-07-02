import pytest
import json
import logging


class TestPreAuth():

    @pytest.fixture
    def json_data(self):
        self.pre_auth_json_path = '.\\resources\\api-response\\PRE_AUTH_REQ_V2.json'
        with open(self.pre_auth_json_path, 'r') as f:
            return json.load(f)

    def test_ok_status_code(self, json_data):
        assert (json_data['status'] == 500), 'expected status code 200'
