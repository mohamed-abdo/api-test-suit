import pytest

class PreAuth(object):
    def __init__(self, *args):
        pass
    
    def test_ok_status_code(self, request):
        assert (request['status'] == 200), 'expected status code 200'