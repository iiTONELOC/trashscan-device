import os
import json
import datetime

ROOT = os.environ['ROOT_USER']
SCANNED_FOLDER = f'/home/{ROOT}/Documents/scanned'
JSON_FILE = SCANNED_FOLDER + '/scanned_data.json'


def create_needed_folders():
    # Look for the scanned folder in the user's Documents folder
    if not os.path.exists(SCANNED_FOLDER):

        os.makedirs(SCANNED_FOLDER)

    # Look for the JSON file in the scanned folder
    if not os.path.exists(JSON_FILE):
        # If the JSON file does not exist, create it
        with open(JSON_FILE, 'w') as f:
            json.dump({"recentlyScanned": []}, f)


def write_to_json(barcode_data: json) -> None:
    with open(JSON_FILE, 'w') as json_file:
        json.dump(barcode_data, json_file)


def add_recent_product(barcode_data: dict) -> None:

    create_needed_folders()
    print('\nAdding product: ')
    print(json.dumps(barcode_data, indent=4))
    print('')

    barcode_data['addedAt'] = datetime.datetime.now().isoformat()

    with open(JSON_FILE, 'r') as json_file:
        file_contents = json.load(json_file)

        if 'recentlyScanned' not in file_contents:
            file_contents['recentlyScanned'] = []

        file_contents['recentlyScanned'].append(barcode_data)

        write_to_json(file_contents)
