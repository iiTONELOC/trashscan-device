import json

from flask import Blueprint, current_app
from lib.server.server_utils import get_scanned_data, package_data

api_route_blueprint = Blueprint('api_route_blueprint', __name__)
num_products = 0


@api_route_blueprint.route("/api/has-update")
def has_update():
    with current_app.app_context():
        global num_products

        num_products = current_app.config.get('NUM_PRODUCTS', 0)
        recently_scanned = package_data(get_scanned_data())
        should_update = len(
            recently_scanned['recentlyScanned']) != num_products
        return json.dumps({'shouldUpdate': should_update})


@api_route_blueprint.route("/api/get-update")
def get_update():
    with current_app.app_context():
        global num_products

        num_products = current_app.config.get('NUM_PRODUCTS', 0)
        recently_scanned = package_data(get_scanned_data())
        num_products = len(recently_scanned['recentlyScanned'])
        current_app.config['NUM_PRODUCTS'] = num_products
        return json.dumps(recently_scanned)
