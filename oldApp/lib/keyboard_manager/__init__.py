import keyboard
import time
import os

from lib.keyboard_manager.utils import find_barcode_scanner, format_buffer


running = True
INPUT_BUFFER = []
SCANNER_INPUT = find_barcode_scanner() or "NULL"


def stop_listening():
    global running
    running = False
    os._exit(0)


def listen_system_keyboard_input(on_action):
    # We don't want to create a key logger and listen to system wide input.
    # We only want to listen in on the barcode scanner
    def key_event(e):
        global INPUT_BUFFER, SCANNER_INPUT

        if SCANNER_INPUT == 'NULL':
            raise ValueError('A barcode scanner was not detected!')

        if e.event_type == "down" and SCANNER_INPUT in e.device \
                and e.name not in ["enter", "esc", "down", "up", "left", "right"]:
            # print('KEYBOARD EVENT: ', e.name, e.event_type, e.device)
            INPUT_BUFFER.append(e.name)

        if e.event_type == "up":
            if e.name == "enter" and SCANNER_INPUT in e.device:
                on_action(format_buffer(INPUT_BUFFER))
                INPUT_BUFFER = []

        if e.name == "esc":
            stop_listening()

    keyboard.hook(key_event)
    fps = 1/24
    while running:
        time.sleep(fps)
