from pathlib import Path
import json
import datetime

root = Path(__file__).parent.parent.parent

AUTH_FILE = str(root) + '/.auth.json'


def get_auth_token():
    """Tries to read the auth token from the current file

    Returns:
        str|None: The auth token as a string or None
    """

    if not Path(AUTH_FILE).is_file():
        print("EXPECTED, file not found")
        with open(AUTH_FILE, 'w')as auth_json:
            json.dump({"expires": "",  "token": ""}, auth_json)
            return

    with open(AUTH_FILE, 'r') as auth_token:
        #  load the token into the auth_token
        auth_token: json = json.load(auth_token)

    if auth_token:
        return auth_token
    else:
        return None


def write_token(token: str):
    """Writes a token to the auth file as a json entry

    Args:
        token (str): the JWT as a string
    """
    existing = get_auth_token()

    current_time = datetime.datetime.now()

    # Add 50 minutes to the current time
    expiration_time = current_time + datetime.timedelta(minutes=50)

    if existing:
        existing.update({
            "expires": expiration_time.timestamp(),
            "token": f"{token}"
        })
    else:
        # create a new token and write it
        existing = {
            "expires": expiration_time.timestamp(),
            "token": f"{token}"
        }

    with open(AUTH_FILE, 'w') as auth_file:
        json.dump(existing, auth_file)


def is_token_expired() -> bool:
    existing = get_auth_token()

    if existing:
        # get the expiration time
        token_expiration = existing["expires"]

        current_time = datetime.datetime.now().timestamp()

        #  see if the current time is greater than the expiration time

        return current_time >= token_expiration
    else:
        return True
