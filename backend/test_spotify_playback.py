import os
from dontenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

load_dotenv()

#Permission for reading devices + whats playing, controlling playback
SCOPES = "user-read-playback-state user-modify-playback-state"

def main():
    auth = SpotifyOAuth(
        client_id=os.getenv
    )
