import os
import json

# check if linux

PREFIX = 'sudo python3' if os.name == 'posix' else 'python'
# PIP install, update


def is_pip_installed():
    try:
        os.system(f'{PREFIX} -m pip')
        return True
    except Exception as e:
        return False


def install_pip():
    os.system(f'{PREFIX} -m pip install pip')
    return True


def update_pip():
    os.system(f'{PREFIX} -m pip install --upgrade pip')
    return True


def install_requirements():
    os.system(f'{PREFIX} -m pip install -r requirements.txt')
    return True


def create_scanned_data_json():
    json_data = {"recentlyScanned": []}

    #  only if the file doesn't exist
    file = 'lib/server/public/scanned/scanned_data.json'

    if not os.path.exists(file):
        with open('lib/server/public/scanned/scanned_data.json', 'w') as json_file:
            json.dump(json_data, json_file)


def run_setup():
    have_pip = is_pip_installed()
    if not have_pip:
        print('Installing pip...')
        install_pip()
    print('Setting up the trash scanner...')
    update_pip()
    install_requirements()
    create_scanned_data_json()
    print('Setup complete!')


def main():
    run_setup()


if __name__ == '__main__':
    main()
