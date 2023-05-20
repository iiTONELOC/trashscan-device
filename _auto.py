import os

from _setup import PREFIX


def run_install():
    os.system(f'{PREFIX} ./_setup.py')


def run_program():
    os.system(f'{PREFIX} ./main.py')


def main():
    run_install()
    run_program()


if __name__ == '__main__':
    main()
