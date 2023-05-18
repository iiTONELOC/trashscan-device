import keyboard
import time
import os

INPUT_BUFFER = []
SCANNER_INPUT = '/dev/input/event1'

running = True


def stop_listening():
    global running
    running = False
    os._exit(0)


def listen_system_keyboard_input(on_action):

    def key_event(e):
        global INPUT_BUFFER
        # print('KEYBOARD EVENT: ', e.name, e.event_type, e.device)

        if e.event_type == "down" and e.device \
                and e.name not in ["enter", "esc", "down", "up", "left", "right"]:
            INPUT_BUFFER.append(e.name)

        if e.event_type == "up":

            if e.name == "enter":
                print("SENDING BARCODE!")

                on_action(INPUT_BUFFER)
                INPUT_BUFFER = []

        if e.name == "esc":
            stop_listening()

    keyboard.hook(key_event)
    fps = 1/24
    while running:
        time.sleep(fps)
