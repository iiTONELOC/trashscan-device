import os
import json
import logging
import subprocess
import multiprocessing
from flask import Flask, send_from_directory
from datetime import datetime, timedelta
from lib.write_to_scanned_json import SCANNED_FOLDER, JSON_FILE

ENVIRONMENT = 'Production' if os.environ['PRODUCTION'] == 'true' else 'Development'
logging.getLogger().handlers = [logging.NullHandler()]


# need to get the cwd to be the grand parent directory of this file
# so that the static files can be served
CWD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STATIC = os.path.normpath(os.path.join(CWD, 'client/dist'))

print('CWD: ', CWD)
print('STATIC: ', STATIC)

app = Flask(__name__)
PORT = 9000
# Allow access over the network only if the environment is in Development, otherwise
# The App should only be accessible locally
HOST = 'localhost' if ENVIRONMENT == 'Production' else '0.0.0.0'


def get_scanned_data():
    # Read the JSON file
    with open(JSON_FILE) as f:
        data = json.load(f)
    return data


num_products = len(get_scanned_data()['recentlyScanned']) or 0


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(STATIC, path)):
        if path.endswith('.js'):
            return send_from_directory(STATIC, path, mimetype='text/javascript')
        elif path.endswith('.css'):
            return send_from_directory(STATIC, path, mimetype='text/css')
        elif path.endswith('.png'):
            return send_from_directory(STATIC, path, mimetype='image/png')
        elif path.endswith('.jpg'):
            return send_from_directory(STATIC, path, mimetype='image/jpg')
        elif path.endswith('.svg'):
            return send_from_directory(STATIC, path, mimetype='image/svg+xml')
        elif path.endswith('.ico'):
            return send_from_directory(STATIC, path, mimetype='image/x-icon')
        elif path.endswith('.map'):
            return send_from_directory(STATIC, path, mimetype='application/json')
        else:
            return send_from_directory(STATIC, path)
    else:
        return send_from_directory(STATIC, "index.html")


@app.route("/api/has-update")
def has_update():
    recently_scanned = package_data(get_scanned_data())
    return json.dumps({'shouldUpdate': len(recently_scanned['recentlyScanned']) != num_products})


@app.route("/api/get-update")
def get_update():
    recently_scanned = package_data(get_scanned_data())

    global num_products
    num_products = len(recently_scanned['recentlyScanned'])

    return json.dumps(recently_scanned)


# Look for the scanned folder in the user's Documents folder
if not os.path.exists(SCANNED_FOLDER):
    os.makedirs(SCANNED_FOLDER)

# Look for the JSON file in the scanned folder
if not os.path.exists(JSON_FILE):
    # If the JSON file does not exist, create it
    with open(JSON_FILE, 'w') as f:
        json.dump({"recentlyScanned": []}, f)


def open_browser():
    subprocess.Popen(
        ['sudo', '-u', 'odroid', 'firefox', '--kiosk', f'http://localhost:{PORT}'], start_new_session=True)


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


class ServerManager:
    def __init__(self):
        self.process = None

    def start_server(self):
        if self.process is not None:
            print("Server is already running.")
            return

        self.process = multiprocessing.Process(target=self._run_server)
        self.process.start()
        print("Server started.")

    def stop_server(self):
        if self.process is not None:
            self.process.terminate()
            self.process.join()
            self.process = None
            print("Server stopped.")
        else:
            print("Server is not running.")

    def exit_handler(self):
        self.stop_server()

    def _run_server(self):
        app.run(host=HOST, port=PORT)


if __name__ == "__main__":
    server_manager = ServerManager()

    # Start the server in a separate process
    server_manager.start_server()
