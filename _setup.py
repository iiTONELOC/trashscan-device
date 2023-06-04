import os
import subprocess

PREFIX = 'python3' if os.name == 'posix' else 'python'
cwd = os.getcwd()
gui_folder = os.path.join(cwd, 'lib','GUI')
  
def install_and_build_gui():
    install_process = subprocess.Popen('npm i', shell=True, cwd=gui_folder)
    install_process.wait()
    os.system(f'cd {gui_folder} && npm run build')
    
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


def run_setup():
    have_pip = is_pip_installed()
    if not have_pip:
        print('Installing pip...')
        install_pip()
    print('Setting up the trash scanner...')
    update_pip()
    install_requirements()
    install_and_build_gui()
    print('Setup complete!')


def main():
    run_setup()


if __name__ == '__main__':
    main()
