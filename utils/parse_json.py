import json


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


class JsonUtils:
    def __init__(self, file_path):
        self.file_path = file_path

    def get_data(self):
        with open(self.file_path, 'r') as f:
            data_dic = json.loads(f.read())
        return ParseJson(data_dic)
