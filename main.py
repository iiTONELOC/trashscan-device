import os
import re
import sys
import json
import logging
import requests
import lib.logger
import lib.write_to_scanned_json as recent_list
from lib.graphql import MUTATIONS
from lib.signal_handler import SignalHandler
# from keyboard_manager import listen_system_keyboard_input
from lib.session_manager import get_auth_token, login, check_session


LOGGER = logging.getLogger('DEFAULT')
BARCODE_LOGGER = logging.getLogger('BARCODE')
ERROR_LOGGER = logging.getLogger('ERROR')
UPC_SERVER_URL = os.environ['UPC_SERVER']

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

        response = requests.post(
            url=UPC_SERVER_URL,
            headers={
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': 'Bearer ' + get_auth_token(),
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

            json_text: json = response.json()
            product: json = json_text['data']['addItemToDefaultList']['product']

            if product != None:
                recent_list.add_recent_product(product)
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
            ERROR_LOGGER.error(f'ERROR SENDING BARCODE: {response.json()}')
            return False
    except Exception as e:
        print(response.json())
        print("ERROR SENDING BARCODE")
        print(e)
        ERROR_LOGGER.error(f'ERROR SENDING BARCODE: {e}, {response.json()}')
        return False


def escape_ansii(string):
    regex = r'(?:\x1B[@-_]|[\x80-\x9F])[0-?]*[ -/]*[@-~]'

    return re.sub(regex, '', string)


def listen_for_input():

    keyboard_input = escape_ansii(str(input()))

    if keyboard_input:
        check_session()
        send_barcode(keyboard_input.strip())


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

        can_run = signal_handler.can_run()

        while (can_run):
            listen_for_input()
            can_run = signal_handler.can_run()

        return close()
    except KeyboardInterrupt:
        return close()


if __name__ == "__main__":
    main()
