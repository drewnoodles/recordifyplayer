import os
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth


load_dotenv()

SCOPES = "user-read-playback-state user-modify-playback-state"

#Create Spotify client using cached token
def get_spotify_client():
    auth_manager = SpotifyOAuth(
        client_id=os.environ["SPOTIFY_CLIENT_ID"],
        client_secret=os.environ["SPOTIFY_CLIENT_SECRET"],
        redirect_uri=os.environ["SPOTIFY_REDIRECT_URI"],
        scope=SCOPES,
        open_browser=True,
        cache_path=".spotify_cache",
    )
    return spotipy.Spotify(auth_manager=auth_manager)

# Pick the active device, or the first available one if no device is active
def pick_device_id(sp: spotipy.Spotify) -> str:
    devices = sp.devices()["devices"]
    if not devices:
        raise ValueError("No devices available")
    
    active = next((d for d in devices if d["is_active"]), None)
    return (active or devices[0])["id"]


# Play a track given its URI
def play_track_uri(uri: str) -> None:
    sp = get_spotify_client()
    device_id = pick_device_id(sp)
    sp.start_playback(device_id=device_id, uris=[uri])

def now_playing():
    sp = get_spotify_client()
    playback = sp.current_user_playing_track()
    if not playback or not playback["item"]:
       return {"is_playing": False, "item": None}

    item = playback["item"]
    artists = ", ".join(a["name"] for a in item["artists"])
    images = item.get("album", {}).get("images", [])
    image_url = images[0]["url"] if images else None

    return {
       "is_playing": playback.get("is_playing", False),
       "progress_ms": playback.get("progress_ms"),
       "item": {
           "name": item["name"],
           "artists": artists,
           "album": item.get("album", {}).get("name"),
           "image_url": image_url,
           "spotify_url": item.get("external_urls", {}).get("spotify"),
           "uri": item.get("uri"),
        },
    }