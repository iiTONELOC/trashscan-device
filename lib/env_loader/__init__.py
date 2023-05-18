# look for a .env file at the root of the project
# if it exists, load the environment variables from it
#
# if not, do nothing

from pathlib import Path
import os

#  get root
cwd = Path(__file__).parent.parent.parent

#  get the .env file
env_path = cwd/'.env'

#  load the environment variables from the file,
#  if it exists
if env_path.exists():
    # open the file and read it
    with open(env_path, 'r') as env_file:
        #  read the file
        env_vars = env_file.read()

        #  split the file into lines
        env_vars = env_vars.split('\n')

        #  iterate over the lines
        for line in env_vars:

            try:
                #  split the line into a key and value, stop on the first '='
                key, value = line.split('=', 1)
                #  set the environment variable
                os.environ[key.strip()] = value.strip()
            except ValueError:
                continue
