import pytest
import json
import logging
import os
from utils.parse_json import TestUtils


class TestCapture:

    @pytest.fixture
    def logging_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @pytest.fixture(autouse=True)
    def json_file_path(self, folder):
        return '.\\resources\\{}\\CAPTURE_DEFAULT.json'.format(folder)

    @pytest.fixture
    def json_data_from_invalid_bene(self, folder):
        if not os.path.exists('.\\resources\\{}\\CAPTURE_INVALID_BENE.json'.format(folder)):
            pytest.skip()
            return None
        return TestUtils.get_data(json_file_path)

    @pytest.fixture
    def json_data_invalid_amount(self, folder):
        if not os.path.exists('.\\resources\\{}\\CAPTURE_EXCEED_AMOUNT.json'.format(folder)):
            pytest.skip()
            return None
        return TestUtils.get_data(json_file_path)

    @pytest.fixture(autouse=True)
    def json_data(self, json_file_path):
        if not os.path.exists(json_file_path):
            pytest.skip()
            return None
        return TestUtils.get_data(json_file_path)

    #@pytest.mark.jira("TT-679")
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

    '''
    Testing invalid collections
    '''

    def test_captured_invalid_bene_code(self, json_data_from_invalid_bene):
        json_data = json_data_from_invalid_bene
        if json_data is None:
            pytest.skip()
            return None
        json_data = json_data_from_invalid_bene
        assert (json_data.status == 400), 'expected status code 400'
        assert (json_data.response.statusInfo.status ==
                'FAILURE'), 'expected FAILURE in status info'
        assert (json_data.response.statusInfo.errorCode.code ==
                'BENE_ACCOUNT_NUMBER_INCORRECT'), 'expected FAILURE code in status info'

    def test_bad_request_status_code(self, json_data_invalid_amount):
        response_data = json_data_invalid_amount
        if response_data is None:
            pytest.skip()
            return None
        assert (response_data.status == 400), 'expected status code 400'
        assert (response_data.response.statusInfo.status ==
                'FAILURE'), 'expected FAILURE in status info'
        assert (response_data.response.statusInfo.errorCode.code ==
                'AMOUNT_EXCEEDED'), 'expected FAILURE code in status info'
