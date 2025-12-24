import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from recordify.spotify_player import play_track_uri

load_dotenv()

#Permission for reading devices + whats playing, controlling playback
SCOPES = "user-read-playback-state user-modify-playback-state"


#Initialize Spotify API client, pull scopes, save token to file via cache_path
def main():
    auth = SpotifyOAuth(
        client_id=os.environ["SPOTIFY_CLIENT_ID"],
        client_secret=os.environ["SPOTIFY_CLIENT_SECRET"],
        redirect_uri=os.environ["SPOTIFY_REDIRECT_URI"],
        scope=SCOPES,
        open_browser=True,
        cache_path=".spotify_cache"
    )

    #Creates Spotify client object with auth manager
    sp = spotipy.Spotify(auth_manager=auth)

    #Get list of devices and print
    devices = sp.devices()["devices"]
    print("\nAvailable devices:")
    #loop through device list and print device name, id, and if active
    for device in devices:
        print(f'- {device["name"]} | id={device["id"]} | active={device["is_active"]}')

    if not devices:
        print("\nNo devices found. Please open Spotify!")
        return
    
    #Pick active device
    device_id = next(
        (device["id"] for device in devices if device["is_active"]),
        devices[0]["id"]
    )

    if __name__ == "__main__":
        play_track_uri("spotify:track:5WbfFTuIldjL9x7W6y5l7R")
        print("Playing track and its so sick!")



main()



