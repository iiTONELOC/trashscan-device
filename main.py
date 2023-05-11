import os
import re
import sys
import json
import logging
import requests
import lib.logger as logger
from pathlib import Path
from dotenv import load_dotenv
from lib.signal_handler import SignalHandler
from lib.keyboard_manager import listen_system_keyboard_input
from lib.session_manager import get_auth_token, login, check_session

PREFIX = '/home/trashscanner/Trash_Scan' if os.name == 'posix' else '.'
load_dotenv(dotenv_path=Path(PREFIX)/'.env')


LOGGER = logging.getLogger('DEFAULT')
BARCODE_LOGGER = logging.getLogger('BARCODE')
BARCODE_DATA_LOGGER = logging.getLogger('DATA')

# look for the TRASH_SCANNER_ENV environment variable
UPC_SERVER_URL = os.environ['UPC_SERVER']

signal_handler = SignalHandler()


def close(message='Closing Trash Scanner...'):
    print(message)
    LOGGER.info(message)
    signal_handler.request_shutdown()
    return sys.exit(0)


def send_barcode(barcode):
    try:

        response = requests.post(
            url=UPC_SERVER_URL,
            headers={
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + get_auth_token(),
            },
            data=json.dumps({
                'operationName': 'addItemToDefaultList',
                'query': """mutation addItemToDefaultList($barcode: String!) {
                    addItemToDefaultList(barcode: $barcode) {
                        _id
                        isCompleted
                        listId
                        notes
                        quantity
                        product {
                        _id
                        productAlias
                        productData {
                            barcode
                            name
                        }
                        }
                    }
                    }""",
                'variables': {'barcode': barcode}

            }),
        )

        code = response.status_code
        text = response.text or 'No response text'

        if code == 200:
            print('\nBarcode sent')
            # print(text)
            # we need to parse the json response to get the recent product
            # information and display it to the user
            json_text = response.json()

            product = json_text['data']['addItemToDefaultList']['product']

            if product != None:
                # pretty print the product information
                # data is currently in json format we can just add indentation to the json string

                product = json.dumps(product, indent=4)
                print('\nBarcode data:')
                print(product)
                print('Waiting for next barcode...\n')
            else:
                print('No product information was found for barcode: ' + barcode)

            BARCODE_LOGGER.info(
                f'Sent barcode: {barcode} to the default list')
            return True
        else:
            print('\nBarcode not sent')
            LOGGER.info(f'Barcode not sent \
            \nStatus Code:{code}\nResponse:\n{text}'
                        .format(code, text))

            print(response.json())
            return False
    except Exception as e:
        print(response.json())
        print("ERROR SENDING BARCODE")
        print(e)
        return False


def escape_ansii(string):
    regex = r'(?:\x1B[@-_]|[\x80-\x9F])[0-?]*[ -/]*[@-~]'

    return re.sub(regex, '', string)


def listen_for_input():

    # def handle_barcode_input(barcode_buffer):
    #    barcode = ''
    #    for key in barcode_buffer:
    #        barcode += str(key)

    #    if barcode and len(barcode) == 12 or len(barcode) == 13:
    #        barcode = escape_ansii(barcode).replace("'", "")

    #        check_session()
    #        send_barcode(barcode)
    #    else:
    #        BARCODE_DATA_LOGGER.error('ERROR Capturing Barcode:')
    #        BARCODE_DATA_LOGGER.error(barcode)

    # def callback(x): return handle_barcode_input(x)

    # TAKES OVER SYSTEM WIDE KEYBOARD INPUT, NOT REALLY GOOD FOR TESTING
    # BUT IT IS WHAT WE NEED LIVE ON THE PI, The below code can be used
    # for testing if needed
    # return listen_system_keyboard_input(callback)

    # FOR TESTING ONLY
    # to system wide keyboard input
    keyboard_input = escape_ansii(str(input()).strip())

    if keyboard_input:
        check_session()
        send_barcode(keyboard_input)


def display_welcome_message():
    print('Welcome to Trash Scanner!')
    print(
        'Trash Scanner is a simple tool that allows you to scan barcodes and add them to your default list in the TrashScan App.')
    print('Press Ctrl+C to exit')


def main():
    LOGGER.info('Starting the program...')

    try:
        login()
        display_welcome_message()
        print('Ready to scan...\n')
        # open the data log in a terminal window so
        # the user can view the scanned data

        # os.system(
        #    'sudo python3 /home/trashscanner/Trash_Scan/scripts/view_data.py')

        while (signal_handler.can_run()):
            listen_for_input()

        close()
    except KeyboardInterrupt:
        close()


if __name__ == "__main__":
    main()
