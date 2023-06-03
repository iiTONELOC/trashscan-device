import os

ENVIRONMENT = 'Production' if os.environ['PRODUCTION'] == 'true' else 'Development'
HOST = 'localhost' if ENVIRONMENT == 'Production' else '0.0.0.0'
CWD = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC = os.path.normpath(os.path.join(CWD, 'client/dist'))
PORT = 9000


MIME_TYPES = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.map': 'application/json'
}
