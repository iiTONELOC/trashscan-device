import evdev
import re


def find_barcode_scanner():
    devices = [evdev.InputDevice(path) for path in evdev.list_devices()]
    for device in devices:
        if device.info.vendor == 0x1fc9 and device.info.product == 0x5aa7:
            return device.fn
    return None


def format_buffer(buffer):
    # take a list of values and convert them into a string
    string = "".join(str(x) for x in buffer)

    # ensure we only have alpha numeric values
    return re.sub(r'[^a-zA-Z0-9]', '', string)
