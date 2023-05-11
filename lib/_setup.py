import os

# check if linux

PREFIX = 'sudo python3' if os.name == 'posix' else 'python'
# PIP install, update
def update_pip():
    os.system(f'{PREFIX} -m pip install --upgrade pip')
    return True

def install_requirements():
    os.system(f'{PREFIX} -m pip install -r requirements.txt')
    return True

def run_setup():
    print('Setting up the trash scanner...')
    update_pip()
    install_requirements()
    print('Setup complete!')

def main():
    run_setup()


if __name__ == '__main__':
    main()
