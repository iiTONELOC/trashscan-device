import os
import logging
from flask import Flask
from lib.server.server import ServerManager
from lib.server.server_utils import get_scanned_data, create_needed_folders
from lib.server.routes import app_route_blueprint, api_route_blueprint, socket_io

logging.getLogger().handlers = [logging.NullHandler()]

# create the folders needed for the server to function properly
create_needed_folders()

# create the Flask app
app = Flask(__name__)
# attach our routes to the Flask app
app.register_blueprint(app_route_blueprint)
app.register_blueprint(api_route_blueprint)

# configure SocketIO
app.config['SECRET_KEY'] = os.environ['SOCKET_SECRET']
# bind SocketIO to the Flask app
socket_io.init_app(app)

# track the number of products scanned
app.config['NUM_PRODUCTS'] = len(get_scanned_data()['recentlyScanned']) or 0

#  instantiate the server manager for easy access
server_manager = ServerManager(socket_io=socket_io, app=app)

if __name__ == "__main__":
    # Start the server in a separate process
    server_manager.start_server()
