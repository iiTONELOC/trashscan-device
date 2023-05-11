import os
import json
import time
import logging
import requests
from pathlib import Path
from dotenv import load_dotenv

env_path = Path('.')/'.env'
load_dotenv(dotenv_path=env_path)

AUTH_TOKEN = None

# 50 mins - tokens are good for one hour
SESSION_LENGTH = 50 * 60
TIME_LOGGED_IN = -1
SESSION_EXPIRES = -1


BARCODE_LOGGER = logging.getLogger('BARCODE')
LOGGER = logging.getLogger('DEFAULT')


def start_session():
    # set the logged in time to the current time
    global TIME_LOGGED_IN, SESSION_EXPIRES, SESSION_LENGTH, AUTH_TOKEN

    if AUTH_TOKEN:
        TIME_LOGGED_IN = time.time()
        SESSION_EXPIRES = TIME_LOGGED_IN + SESSION_LENGTH


def is_session_expired():
    # check the current time against the session expires time
    global SESSION_EXPIRES, TIME_LOGGED_IN, AUTH_TOKEN

    if SESSION_EXPIRES == -1 or TIME_LOGGED_IN == -1:
        return True

    if not AUTH_TOKEN:
        return True

    return time.time() > SESSION_EXPIRES


def revoke_session():
    global AUTH_TOKEN, SESSION_EXPIRES, TIME_LOGGED_IN

    AUTH_TOKEN = None
    SESSION_EXPIRES = -1
    TIME_LOGGED_IN = -1


class LoginError(Exception):
    """Raised when there is an error logging in"""
    pass


def login():
    # login to the server
    URL = os.environ['UPC_SERVER']

    log_in_response = requests.post(
        URL,
        headers={
            'Content-Type': 'application/json'
        },

        data=json.dumps({
            'operationName': 'login',
            'query': 'mutation login($username: String!, $password: String!) {loginUser(username: $username, password: $password) {token user { _id  email username } }}',
            'variables': {'username': os.environ['TRASH_USER'], 'password': os.environ['PASS']},
        }),
        verify=False
    )

    print('login response: ', log_in_response)
    # print out all the response data
    print('login response data: ', log_in_response.json())

    # check for the token in the data field
    if log_in_response.status_code == 200:
        data = log_in_response.json()
        global AUTH_TOKEN
        AUTH_TOKEN = data['data']['loginUser']['token']

        LOGGER.info("LOGGED IN")
        start_session()

    elif log_in_response.status_code == 401:
        LOGGER.error("LOGIN ERROR: 401")
        raise LoginError()
    else:
        LOGGER.error("LOGIN ERROR: " + str(log_in_response.status_code))
        raise LoginError()


def get_auth_token() -> str:
    global AUTH_TOKEN
    return AUTH_TOKEN if AUTH_TOKEN else ''


def check_session():
    is_expired = is_session_expired()

    if is_expired:
        LOGGER.info("SESSION EXPIRED - REQUESTING NEW TOKEN")
        revoke_session()
        login()
