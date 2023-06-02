import os
import json
import datetime
from pathlib import Path

ROOT = os.path.expanduser('~')
SCANNED_FOLDER = f'{ROOT}/Documents/scanned'
JSON_FILE = SCANNED_FOLDER + '/scanned_data.json'


def write_to_json(barcode_data: json) -> None:
    with open(JSON_FILE, 'w') as json_file:
        json.dump(barcode_data, json_file)


def add_recent_product(barcode_data: dict) -> None:

    print('\nAdding product: ')
    print(json.dumps(barcode_data, indent=4))
    print('')

    barcode_data['addedAt'] = datetime.datetime.now().isoformat()

    if not Path(SCANNED_FOLDER).is_dir():
        os.mkdir(SCANNED_FOLDER)

    if not Path(JSON_FILE).is_file():
        write_to_json({'recentlyScanned': [barcode_data]})
    else:
        with open(JSON_FILE, 'r') as json_file:
            file_contents = json.load(json_file)

        if 'recentlyScanned' not in file_contents:
            file_contents['recentlyScanned'] = []

        file_contents['recentlyScanned'].append(barcode_data)

        write_to_json(file_contents)
