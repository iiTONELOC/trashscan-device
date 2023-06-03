import multiprocessing
from lib.server.server_constants import HOST, PORT, PORT


class ServerManager:
    def __init__(self, socket_io, app):
        self.process = None
        self.app = app
        self.socket_io = socket_io

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
        self.socket_io.run(app=self.app, host=HOST, port=PORT)
