import json
import os
import pytest
import logging


class ParseJson:
    def __init__(self, obj):
        for k, v in obj.items():
            if isinstance(v, dict):
                setattr(self, k, ParseJson(v))
            else:
                setattr(self, k, v)

    def __getitem__(self, val):
        return self.__dict__[val]

    def __repr__(self):
        return '{%s}' % str(', '.join('%s : %s' % (k, repr(v)) for
                                      (k, v) in self.__dict__.items()))


class TestUtils:

    def get_data(file_path):
        try:
            if not os.path.exists(file_path):
                return None
            with open(file_path, 'r') as f:
                data_dic = json.loads(f.read())
            return ParseJson(data_dic)
        except Exception as e:
            logging.error(
                'error while loading json data file {}'.format(file_path))
