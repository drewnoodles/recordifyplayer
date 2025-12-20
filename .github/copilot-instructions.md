# RecordifyPlayer Backend - AI Agent Instructions

## Architecture Overview
This is a FastAPI-based backend service for managing user-defined tags on Spotify tracks and playlists. The system consists of:

- **API Layer** (`recordify/main.py`): FastAPI endpoints for tag CRUD operations
- **Data Layer** (`recordify/db.py`): SQLite database operations with a `tags` table (uid, spotify_uri, label, updated_at)
- **Spotify Integration** (`recordify/spotify_utils.py`): Normalizes Spotify URLs/URIs to standard `spotify:{type}:{id}` format

## Key Patterns & Conventions

### Database Operations
- Use SQLite with path `backend/data/recordify.db`
- Implement upserts with `INSERT ... ON CONFLICT(uid) DO UPDATE`
- Store timestamps as ISO format strings (`datetime.utcnow().isoformat()`)
- Return tag data as dictionaries with keys: `uid`, `spotify_uri`, `label`, `updated_at`

### Spotify URI Handling
- Accept both Spotify URLs (`https://open.spotify.com/track/{id}`) and URIs (`spotify:track:{id}`)
- Normalize all inputs to URI format using `normalize_spotify_input()`
- Support only `track` and `playlist` types (defined in `ALLOWED_TYPES`)
- Validate URIs have exactly 3 colon-separated parts

### API Design
- Use Pydantic `BaseModel` for request/response validation
- Follow RESTful patterns: `GET /api/tags`, `GET /api/tags/{uid}`, `POST /api/tags/{uid}`
- Handle 404s for missing tags, 400s for invalid Spotify inputs
- Include startup event for database initialization

### Testing Approach
- Write simple test scripts in `backend/` (e.g., `test_db.py`, `test_spotify_playback.py`)
- Manually run scripts to verify functionality
- Use direct imports and function calls rather than formal test frameworks

### Development Workflow
- Run server: `uvicorn recordify.main:app --reload` from `backend/` directory
- Environment variables in `backend/.env` (Spotify API credentials)
- Database files ignored in `.gitignore` (recreated on startup)
- Virtual environment in project root `venv/`

### Dependencies
- **FastAPI**: Web framework with automatic OpenAPI docs
- **Spotipy**: Spotify Web API client (used in playback tests)
- **Pydantic**: Data validation and serialization
- **SQLite3**: Built-in database (no external server needed)

## Code Examples

### Adding New Tag Endpoint
```python
@app.post("/api/tags/{uid}")
def api_upsert_tag(uid: str, body: TagUpsert):
    try:
        uri = normalize_spotify_input(body.spotify_uri)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    upsert_tag(uid, uri, body.label)
    return {"Saved!": True, "uid": uid, "uri": uri}
```

### Database Upsert Pattern
```python
def upsert_tag(uid: str, spotify_uri: str, label: str | None = None) -> None:
    now = datetime.utcnow().isoformat()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
            INSERT INTO tags (uid, spotify_uri, label, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET
                spotify_uri = excluded.spotify_uri,
                label = excluded.label,
                updated_at = excluded.updated_at
        """, (uid, spotify_uri, label, now))
```

### Spotify Input Normalization
```python
def normalize_spotify_input(value: str) -> str:
    if value.startswith("spotify:"):
        parts = value.split(":")
        if len(parts) != 3:
            raise ValueError("Invalid Spotify URI format")
        _, kind, sid = parts
        if kind not in {"track", "playlist"}:
            raise ValueError("Unsupported Spotify link!")
        return f"spotify:{kind}:{sid}"
    # Handle URLs similarly...
```</content>
<parameter name="filePath">c:\Users\green\OneDrive\Documents\recordifyplayer\.github\copilot-instructions.md