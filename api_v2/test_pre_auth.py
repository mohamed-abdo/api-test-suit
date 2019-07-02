import pytest
import json
import logging

from utils.ParseJson import ParseJson


class TestPreAuth():

    @pytest.fixture
    def normal_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @pytest.fixture
    def json_data(self):
        self.pre_auth_json_path = '.\\resources\\api-response\\PRE_AUTH_REQ_V2.json'
        with open(self.pre_auth_json_path, 'r') as f:
            data_dic = json.loads(f.read())
            return ParseJson(data_dic)

    def test_ok_status_code(self, json_data):
        assert (json_data.status == 200), 'expected status code 200'
