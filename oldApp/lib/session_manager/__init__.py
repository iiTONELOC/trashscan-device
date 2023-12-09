import os
import json
import time
import logging
import datetime
import requests
import multiprocessing
from .token_utils import write_token, is_token_expired, get_auth_token

ERROR_LOGGER = logging.getLogger('ERROR')
LOGGER = logging.getLogger('DEFAULT')

SESSION = None
STOP_SESSION = False


# Define the function to be executed in the background as a coroutine

def check_auth():
    while True:
        if is_token_expired():
            login()
        else:
            # get the current token so we can get the expiration
            current_token = get_auth_token()
            current_exp = current_token['expires']

            # calculate the remaining time
            #  the current_exp is a date.now timestamp
            now = datetime.datetime.now().timestamp()

            # calculate the time remaining
            remaining = now - current_exp
            remaining = datetime.timedelta(seconds=remaining)

            # sleep for the remaining time - minutes
            time.sleep((remaining.seconds % 3600))

# Create a class to manage the background task and event loop


class SessionManager:
    def __init__(self):
        self.background_process = None

    def start(self):
        self.background_process = multiprocessing.Process(
            target=check_auth)
        self.background_process.start()

    def stop(self):
        if self.background_process:
            self.background_process.join()

    def exit_handler(self):
        self.stop()


# Create an instance of the SessionManager
session_manager = SessionManager()


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
        })
    )

    # check for the token in the data field
    if log_in_response.status_code == 200:
        data = log_in_response.json()
        AUTH_TOKEN = data['data']['loginUser']['token']

        write_token(AUTH_TOKEN)
        LOGGER.info('LOGGED IN')

    elif log_in_response.status_code == 401:
        ERROR_LOGGER.error('LOGIN ERROR: 401')
    else:
        ERROR_LOGGER.error('LOGIN ERROR: ' + str(log_in_response.status_code))


def check_session():
    is_expired = is_token_expired()

    if is_expired:
        LOGGER.info('SESSION EXPIRED - REQUESTING NEW TOKEN')
        login()
