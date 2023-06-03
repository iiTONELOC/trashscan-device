import os

from flask import Blueprint, send_from_directory
from lib.server.server_constants import STATIC, MIME_TYPES


app_route_blueprint = Blueprint('app_route_blueprint', __name__)


@app_route_blueprint.route('/', defaults={'path': ''})
@app_route_blueprint.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(STATIC, path)):
        file_extension = os.path.splitext(path)[1]
        mimetype = MIME_TYPES.get(file_extension, None)
        return send_from_directory(STATIC, path, mimetype=mimetype)
    else:
        return send_from_directory(STATIC, "index.html")
