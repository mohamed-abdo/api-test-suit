from api_v2.pre_auth import PreAuth

def build_dict():
    pauth = PreAuth()
    assertions_dic={'PRE_AUTH_REQ_V2': [pauth.test_ok_status_code]}

    return assertions_dic