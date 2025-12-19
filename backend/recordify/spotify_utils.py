from urllib.parse import urlparse

ALLOWED_TYPES = {"track","playlist"}



def normalize_spotify_input(value: str) -> str:
    """
    Accepts:
     Spotify URL and URI
    Returns:
     Spotify URI: spotify:{type}:{id}
    """
    value = value.strip()

#Case 1: Already a Spotify URI, take its type and ID
#len() checking is to ensure it's a valid Spotify URI for 3 items in list
    if value.startswith("spotify:"):
        parts = value.split(":")
        if len(parts) != 3:
            raise ValueError("Invalid Spotify URI format")
        #parts[ be ["spotify", "type", "id"] 
        _, parsed_kind, sid = parts
        if parsed_kind not in ALLOWED_TYPES:
            raise ValueError("Unsupported Spotify link!")
        if not sid:
            raise ValueError("Missing Spotify ID!")
        return f"spotify:{parsed_kind}:{sid}"
    
#Case 2: Spotify URL, extract the type and ID from the path
    parsed_url = urlparse(value)
    #if not a valid Spotify URL, raise error
    if parsed_url.netloc not in {"open.spotify.com", "api.spotify.com"}:
        raise ValueError("Unsupported Spotify link!")

#Path looks like /track/{id} or /playlist/{id}
    path_parts = [p for p in parsed_url.path.split("/") if p]
    if len(path_parts) < 2:
        raise ValueError("Invalid Spotify URL format")

    kind, sid = path_parts[0], path_parts[1]
    if kind not in ALLOWED_TYPES:
        raise ValueError("Unsupported Spotify link!")
    return f"spotify:{kind}:{sid}" 