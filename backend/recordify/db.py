import sqlite3
from pathlib import Path
from datetime import date, datetime 


#variable to store path to database file. 
# __file__ = current file, 2x parent = 2 levels up folder, /data = go to data folder, /recordify.db = go to recordify.db file
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "recordify.db"

def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute("""
                     CREATE TABLE IF NOT EXISTS tags (
                     uid TEXT PRIMARY KEY,
                     spotify_uri TEXT NOT NULL,
                     label TEXT,
                     updated_at TEXT NOT NULL)
                     """)
        conn.commit()


#Function to insert/update tag in db
#ON conflict = if there is a conflict (same uid), update the row with new values
#excluded. = new values from the insert statement

def upsert_tag(uid: str, spotify_uri: str, label: str | None = None) -> None:
    now = datetime.utcnow().isoformat()

    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            INSERT INTO tags (uid, spotify_uri, label, updated_at)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET
                spotify_uri = excluded.spotify_uri,
                label = excluded.label,
                updated_at = excluded.updated_at
            """,
            (uid, spotify_uri, label, now),
        )
        conn.commit()


#Get tag from db
#with coonnect to db, create if nonexistent, fetch tags table, return columns if found, return None if not found
def get_tag(uid: str) -> dict | None:
    with sqlite3.connect(DB_PATH) as conn:
        row = conn.execute(
            """
            SELECT uid, spotify_uri, label, updated_at
            FROM tags
            WHERE uid = ?
            """,
            (uid,),
        ).fetchone()

        if row is None:
            return None
        #return row as dictionary with keys as column names, instead of fetching index
        return {
            "uid": row[0],
            "spotify_uri": row[1],
            "label": row[2],
            "updated_at": row[3],
        }
    
#Get all tags from db
#with coonnect to db, create if nonexistent, fetch tags table, return columns if found, return None if not found
#Select(Grab) uid, spotify_uri, label, updated_at from tags table, order by updated, fetch
def get_all_tags() -> list[dict]:
    with sqlite3.connect(DB_PATH) as conn:
        rows = conn.execute(
            """
            SELECT uid, spotify_uri, label, updated_at
            FROM tags
            ORDER BY updated_at DESC
            """
        ).fetchall()
    #create empty list to store tags
    tags = []
#rows is list of tuples, loop through each tuple, append(add to end of list) to tags list as dictionary
    for row in rows:
        tags.append(
        {
            "uid": row[0],
            "spotify_uri": row[1],
            "label": row[2],
            "updated_at": row[3],
        }
    )

    return tags