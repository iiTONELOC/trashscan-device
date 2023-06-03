import os
import json
import logging
import multiprocessing
from flask_socketio import SocketIO
from flask import Flask, send_from_directory
from lib.server.server_constants import HOST, STATIC, PORT, MIME_TYPES, PORT
from lib.server.server_utils import get_scanned_data, package_data, create_needed_folders


logging.getLogger().handlers = [logging.NullHandler()]

# create the Flask app
app = Flask(__name__)

# configure SocketIO
app.config['SECRET_KEY'] = os.environ['SOCKET_SECRET']
socket_io = SocketIO(app)
# track the number of products scanned
num_products = len(get_scanned_data()['recentlyScanned']) or 0

# create the folders needed for the server to function properly
create_needed_folders()


############## ROUTES ##############

#  REACT APP
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(STATIC, path)):
        file_extension = os.path.splitext(path)[1]
        mimetype = MIME_TYPES.get(file_extension, None)
        return send_from_directory(STATIC, path, mimetype=mimetype)
    else:
        return send_from_directory(STATIC, "index.html")


#  API ENDPOINTS
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


############## SOCKET IO ##############

@socket_io.on('client connected')
def handle_connect():
    print('Client connected')


@socket_io.on('disconnect')
def handle_disconnect():
    print('Client disconnected')


@socket_io.on('message_from_client')
def handle_message_from_client(message):
    print('Received message from client:', message)
    # You can process the message here and send updates to the client if needed
    # Emit an event to all connected clients
    socket_io.emit('message_from_server', 'This is a message from the server')


# _______ Exposed Server API _______
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
        socket_io.run(app, host=HOST, port=PORT)


# Starts the server in a separate process if this file is run directly as a script, not
# recommended since the server should be started from main.py
if __name__ == "__main__":
    server_manager = ServerManager()

    # Start the server in a separate process
    server_manager.start_server()
