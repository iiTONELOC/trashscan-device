from pathlib import Path
import json
import datetime


def add_recent_product(barcode_data: json) -> None:
    """Writes the barcode data to the scanned_data.json file

    Args:
        barcode_data (json): Returned barcode data from the server
    """
    CWD = str(Path(__file__).parent.parent.parent)
    SCANNED_FOLDER = CWD + '/lib/server/public/scanned'
    JSON_FILE = SCANNED_FOLDER + '/scanned_data.json'

    FILE_CONTENTS: json = {}

    # append a timestamp to the barcode data
    barcode_data['addedAt'] = datetime.datetime.now().isoformat()

    # see if the file exists
    if not Path(JSON_FILE).is_file():
        #  create the file
        with open(JSON_FILE, 'w') as json_file:
            json.dump({'recentlyScanned': [barcode_data]}, json_file)
        return
    else:

        with open(JSON_FILE, 'r') as json_file:
            FILE_CONTENTS = json.load(json_file)
            temp = {"recentlyScanned": []}

            try:
                temp.update({'recentlyScanned': [
                            barcode_data] + FILE_CONTENTS['recentlyScanned']})
            except Exception:
                temp.update({'recentlyScanned': [barcode_data]})
            #  write the new data to the file

        with open(JSON_FILE, 'w') as json_file:
            try:
                json.dump(temp, json_file)
            except Exception:
                return
