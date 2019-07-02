import pytest
import logging

class BaseTest:
    def __int__(self,*args):
        print('base constructor functional testing ....')
    
    @pytest.fixture
    def normal_fixture(self, caplog):
        caplog.set_level(logging.WARNING)

    @classmethod
    def setup_class(self):
        logging.info("starting api v2  functional test.")