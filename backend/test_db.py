from recordify.db import init_db, upsert_tag


init_db()
print("Database initialized successfully.")

uid="abc123"
upsert_tag(uid,"spotify:track:first", "MY TAG")
upsert_tag(uid,"spotify:track:first", "MY TAG 2")

print("Tags upserted successfully.")