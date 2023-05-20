import os
import logging
import http.server
import socketserver
import multiprocessing
import subprocess


ROOT_USER = os.environ['ROOT_USER'] or ''


def open_url(url):
    global open_browser

    # subprocess.Popen(
    #     ['sudo', '-b', '-u', ROOT_USER, 'xdg-open', '--browser',
    #      'chromium-browser', url],
    #     start_new_session=True)
    # subprocess.Popen(
    #     ['sudo', '-b', '-u', ROOT_USER, 'xdg-open', url],
    #     start_new_session=True)
    subprocess.Popen(['midori', '-e', 'Fullscreen',
                     '-a', url], start_new_session=True)


logging.getLogger().handlers = [logging.NullHandler()]


class SimpleServer:
    def __init__(self,  port=8000):
        self.port = port
        self.handler = None
        self.server = None

    def start_server(self):
        if self.server:
            print("Server is already running.")
            return

        self.handler = CustomRequestHandler

        self.server = socketserver.TCPServer(("", self.port), self.handler)
        print(f"Server listening on port {self.port}")

        try:
            self.server.serve_forever()
        except KeyboardInterrupt:
            self.stop_server()

    def stop_server(self):
        if self.server:
            self.server.shutdown()
            self.server.server_close()
            self.server = None
            print("Server stopped.")
        else:
            print("Server is not running.")


class CustomRequestHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def translate_path(self, path):
        try:
            """Translate a given path to the corresponding path in the public folder."""
            public_path = os.path.abspath(self.directory)
            requested_path = os.path.normpath(path.lstrip('/'))
            full_path = os.path.join(
                public_path,
                'lib',
                'server',
                'public',
                requested_path)

            if requested_path == "index.html" or \
                "assets/" in requested_path or\
                    requested_path == "scanned/scanned_data.json":
                if not os.path.exists(full_path):
                    raise FileNotFoundError
                else:
                    return full_path

            else:
                raise ValueError
        except Exception:
            raise ValueError

    def do_GET(self):
        try:
            if self.path == '/':
                self.path = '/index.html'  # Serve index.html for the root path
            super().do_GET()
        except Exception:
            self.send_error(400, "Bad Request")

    if os.getenv('PRODUCTION', False) == False \
            or os.getenv('PRODUCTION', False) == 'False':

        def end_headers(self):
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            super().end_headers()

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Content-Length", "0")
            self.end_headers()


class ServerManager:
    def __init__(self):
        self.background_process = None

    def start(self):
        self.background_process = multiprocessing.Process(
            target=start_server)
        self.background_process.start()

    def stop(self):
        if self.background_process:
            self.background_process.join()

    def exit_handler(self):
        self.stop()


server_manager = ServerManager()


def start_server():
    # launch a browser window
    open_url('http://localhost:8000')
    while True:
        server = SimpleServer(port=8000)
        server.start_server()
