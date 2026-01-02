import { useEffect, useState } from "react";

const API = "http://localhost:8000";

function App() {
  const [uid, setUid] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);

  async function saveTag() {
    await fetch(`${API}/api/tags/${uid}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spotify_uri: spotifyUrl }),
    });
    alert("Saved!");
  }

  async function playTag() {
    await fetch(`${API}/api/play/${uid}`, { method: "POST" });
  }

  async function fetchNowPlaying() {
    try {
      const res = await fetch(`${API}/api/now_playing`);

      if (!res.ok) {
        console.error("Failed to fetch now playing", res.status, res.statusText);
        setNowPlaying(null);
        return;
      }

      const data = await res.json();
      setNowPlaying(data);
    } catch (err) {
      console.error("Error fetching now playing", err);
      setNowPlaying(null);
    }
  }

  useEffect(() => {
    fetchNowPlaying();
    const id = setInterval(fetchNowPlaying, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>🎵 Recordify Player</h1>

      <h2>Tag Editor</h2>
      <input
        placeholder="UID"
        value={uid}
        onChange={(e) => setUid(e.target.value)}
      />
      <br />
      <input
        placeholder="Spotify URI or URL"
        value={spotifyUrl}
        onChange={(e) => setSpotifyUrl(e.target.value)}
      />
      <br />
      <button onClick={saveTag}>Save</button>
      <button onClick={playTag}>Play</button>

      <h2>Now Playing</h2>
      {nowPlaying?.item ? (
        <>
          <p>{nowPlaying.item.name}</p>
          <p>{nowPlaying.item.artists}</p>
          <img
            src={nowPlaying.item.image_url}
            width={200}
            alt="Album cover"
          />
        </>
      ) : (
        <p>Nothing playing</p>
      )}
    </div>
  );
}

export default App;