
from flask_socketio import SocketIO

socket_io = SocketIO()


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
