from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from recordify.db import init_db, upsert_tag, get_tag, get_all_tags
from recordify.spotify_utils import normalize_spotify_input
from recordify.spotify_player import play_track_uri
from fastapi import HTTPException
from recordify.spotify_player import now_playing
from fastapi.middleware.cors import CORSMiddleware 
from dotenv import load_dotenv


load_dotenv()


app = FastAPI()

@app.on_event("startup")
def startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5175",     # your React dev server
        "http://localhost:5173",     # common vite port
        "http://127.0.0.1:5175",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



#pydantic model for tag, spotify_uri responds with uri of track, msg if needed
class TagUpsert(BaseModel):
    spotify_uri: str
    label: str | None = None

#list all tags in db
@app.get("/api/tags")
def api_list_tags():
    return {"tags": get_all_tags()}

#get tag from db
@app.get("/api/tags/{uid}")
def api_get_tag(uid: str):
    tag = get_tag(uid)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"tag": tag}

#save tag to db, if tag already exists, update it, 
@app.post("/api/tags/{uid}")
def api_upsert_tag(uid: str, body: TagUpsert):
    try:
        uri = normalize_spotify_input(body.spotify_uri)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    upsert_tag(uid, uri, body.label)
    kind = uri.split(":")[1]
    return {"Saved!": True, "uid": uid, "uri" : uri, "playlist/track" : kind, "body.label": body.label}

@app.post("/api/play/{uid}")
def play_by_uid(uid: str):
    tag = get_tag(uid)
    if tag is None:
        raise HTTPException(status_code=404, detail="UID not found")

    try:
        play_track_uri(tag["spotify_uri"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"Playing!": True, "uid": uid, "uri" : tag["spotify_uri"], "label" : tag["label"]}

@app.get("/api/now_playing")
def api_now_playing():
    return now_playing()

#backend test endpoints
@app.get("/")
def root():
    return {"message": "recordifyplayer backend running"}

@app.get("/health")
def health():
    return {"ok": True}