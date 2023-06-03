import os
import json
import subprocess
from datetime import datetime, timedelta
from lib.server.server_constants import PORT
from lib.write_to_scanned_json import JSON_FILE, SCANNED_FOLDER


def get_scanned_data():
    # Read the JSON file
    with open(JSON_FILE) as f:
        data = json.load(f)
    return data


def format_created_at(date):
    # Show the date as "time ago" if the date is less than 24 hours ago
    # If it is more than 24 hours ago, show the date as a formatted string
    time_now = datetime.now()
    date_time = datetime.fromisoformat(date)
    time_diff = time_now - date_time
    _24_hours = timedelta(days=1)

    if time_diff < _24_hours:
        # Show "time ago"
        hours = time_diff // timedelta(hours=1)
        mins = time_diff // timedelta(minutes=1)
        seconds = time_diff // timedelta(seconds=1)
        time_ago = ""

        if hours > 0:
            time_ago += f"{hours} {'hours' if hours > 1 else 'hour'} ago"
        elif mins > 0:
            time_ago += f"{mins} {'minutes' if mins > 1 else 'minute'} ago"
        else:
            time_ago += f"{seconds} {'seconds' if seconds > 1 else 'second'} ago"

        return time_ago
    else:
        # Show formatted date
        return date_time.strftime("%b %d, %Y %I:%M %p")


def package_data(data):
    temp = []
    for product in data['recentlyScanned']:
        data = {
            'id': product['_id'],
            'name': product['productAlias'] or product['productData']['name'],
            'barcode': product['productData']['barcode'][0],
            'createdAt': format_created_at(product['addedAt']),
            'headerClass': 'card-header'
        }

        if data['name'] == 'Product not found':
            data['headerClass'] = "card-header not-found"

        temp.append(data)

    # Reverse the list so the most recent scan is at the top
    temp.reverse()
    return {'recentlyScanned': temp}


def open_browser():
    subprocess.Popen(
        ['sudo', '-u', 'odroid', 'firefox', '--kiosk', f'http://localhost:{PORT}'], start_new_session=True)


def create_needed_folders():
    # Look for the scanned folder in the user's Documents folder
    if not os.path.exists(SCANNED_FOLDER):
        os.makedirs(SCANNED_FOLDER)

    # Look for the JSON file in the scanned folder
    if not os.path.exists(JSON_FILE):
        # If the JSON file does not exist, create it
        with open(JSON_FILE, 'w') as f:
            json.dump({"recentlyScanned": []}, f)
