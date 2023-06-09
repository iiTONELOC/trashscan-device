import os
import re
import sys
import json
import time
import atexit
import logging
import requests
import lib.logger
import subprocess
import lib.write_to_scanned_json as recent_list

from lib.graphql import MUTATIONS
from lib.signal_handler import SignalHandler
from lib.session_manager.token_utils import get_auth_token
from lib.keyboard_manager import listen_system_keyboard_input
from lib.session_manager import login, check_session, session_manager

SERVER = None
PORT = os.environ['PORT'] or 9000
ROOT_USER = os.environ['ROOT_USER']
LOGGER = logging.getLogger('DEFAULT')
ERROR_LOGGER = logging.getLogger('ERROR')
UPC_SERVER_URL = os.environ['UPC_SERVER']
BARCODE_LOGGER = logging.getLogger('BARCODE')
PRODUCTION = os.environ['PRODUCTION'] == 'True'


signal_handler = SignalHandler()


def close(message='Closing Trash Scanner...'):
    print(message)
    LOGGER.info(message)
    signal_handler.request_shutdown()
    return sys.exit(0)


def send_barcode(barcode):

    if not isinstance(barcode, str) or len(barcode) < 10:
        print('Invalid barcode: ' + barcode)
        BARCODE_LOGGER.error('Invalid barcode: ' + barcode)
        return False
    try:
        auth = get_auth_token() or {"token": None}

        response = requests.post(
            url=UPC_SERVER_URL,
            headers={
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + auth['token'],
            },
            data=json.dumps({
                'operationName': MUTATIONS['ADD_ITEM']['operationName'],
                'query': MUTATIONS['ADD_ITEM']['query'],
                'variables': {'barcode': barcode}
            }),
        )

        code: int = response.status_code
        text: str = response.text or 'No response text'

        if code == 200:
            print('\nBarcode sent')

            try:
                json_text: json = response.json()
                product: json = json_text['data']['addItemToDefaultList']['product']

                if product != None:
                    recent_list.add_recent_product(product)
                    requests.post(
                        url=f'http://localhost:{PORT}/api/newly-scanned',
                        headers={
                            'Content-Type': 'application/json; charset=utf-8',
                        },
                        data=json.dumps({
                            'barcodeData': product
                        }),
                    )

                    product = json.dumps(product, indent=4)

                    print('Waiting for next barcode...\n')
                else:
                    print('No product information was found for barcode: ' + barcode)

                BARCODE_LOGGER.info(
                    f'Sent barcode: {barcode} to the default list')
                return True
            except Exception as e:
                print(e)
                BARCODE_LOGGER.error('ERROR SENDING BARCODE')
                return False
        else:
            print('\nBarcode not sent')
            LOGGER.info(f'Barcode not sent \
            \nStatus Code:{code}\nResponse:\n{text}'
                        .format(code, text))

            print(response.json())
            ERROR_LOGGER.error(f'ERROR SENDING BARCODE: {response.json()}')
            return False
    except Exception as e:

        print("ERROR SENDING BARCODE")
        print(e)
        ERROR_LOGGER.error(f'ERROR SENDING BARCODE: {e}')
        return False


def escape_ansii(string):
    regex = r'(?:\x1B[@-_]|[\x80-\x9F])[0-?]*[ -/]*[@-~]'

    return re.sub(regex, '', string)


def listen_for_input():
    if PRODUCTION:
        def _action(data):
            send_barcode(data)

        listen_system_keyboard_input(_action)
    else:
        keyboard_input = escape_ansii(str(input()))

        if keyboard_input:
            check_session()
            send_barcode(keyboard_input.strip())


def display_welcome_message():
    print('\nWelcome to Trash Scanner!\n')
    print(
        'Trash Scanner is a simple tool that allows you to scan barcodes and add them to your default list in the TrashScan App.\n')
    print('Press Ctrl+C to exit')


def start_gui():
    cwd = os.path.join(os.getcwd(),'lib', 'GUI')
    # check if we are in production
    global SERVER
    if PRODUCTION:
        SERVER = subprocess.Popen(['sudo', '-u', f'{ROOT_USER}','npm', 'run', 'start'],
                                  cwd=cwd, start_new_session=True)
        
        # sleep for a few seconds before starting the  Firefox window, give the server a sec to come online
        time.sleep(5)
          #  Launch Firefox in Kiosk mode to our GUI which is hosted at localhost:PORT
        subprocess.Popen(
            ['sudo', '-u', f'{ROOT_USER}', 'firefox', '--kiosk', f'http://localhost:{PORT}'], start_new_session=True)
    else:
        SERVER = subprocess.Popen(['sudo', '-u', f'{ROOT_USER}','npm', 'run', 'dev'],
                                  cwd=cwd, start_new_session=True)

  


def main():
    LOGGER.info('Starting the program...')
    atexit.register(session_manager.exit_handler)

    def start_background_services():
        session_manager.start()
        start_gui()

    def stop_background_services():
        session_manager.stop()

        if SERVER:
            SERVER.kill()

    try:
        login()
        start_background_services()
        display_welcome_message()
        print('Ready to scan...\n')

        while (signal_handler.can_run()):
            listen_for_input()

        stop_background_services()
        return close()

    except KeyboardInterrupt:
        stop_background_services()
        return close()


if __name__ == "__main__":
    main()
