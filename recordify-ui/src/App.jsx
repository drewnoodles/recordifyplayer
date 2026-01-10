import { useEffect, useMemo, useState } from "react";

const API = "http://localhost:8000";

function App() {
  const [uid, setUid] = useState("");
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [nowPlaying, setNowPlaying] = useState(null);
  const [saving, setSaving] = useState(false);
  const [playing, setPlaying] = useState(false);

  const isPlaying = nowPlaying?.is_playing === true;
  const item = nowPlaying?.item ?? null;

  // We keep styles in one place so the JSX stays readable
  const styles = useMemo(
    () => ({
      page: {
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0b1220 0%, #070a12 100%)",
        color: "#e9edf7",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
      container: {
        maxWidth: 1000,
        margin: "0 auto",
        padding: "28px 18px 60px",
      },
      header: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 18,
      },
      title: {
        fontSize: 28,
        fontWeight: 800,
        letterSpacing: 0.2,
        margin: 0,
      },
      subtitle: {
        margin: 0,
        opacity: 0.7,
        fontSize: 14,
      },
      grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1.3fr",
        gap: 16,
      },
      card: {
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        backdropFilter: "blur(10px)",
      },
      cardTitleRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
      },
      cardTitle: { margin: 0, fontSize: 16, fontWeight: 750 },
      badge: {
        fontSize: 12,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.18)",
        background: isPlaying
          ? "rgba(46, 213, 115, 0.12)"
          : "rgba(255,255,255,0.06)",
        color: isPlaying ? "#b8ffd4" : "#d6dcf2",
      },
      field: { display: "flex", flexDirection: "column", gap: 8 },
      label: { fontSize: 12, opacity: 0.75 },
      input: {
        padding: "12px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(0,0,0,0.20)",
        color: "#e9edf7",
        outline: "none",
      },
      row: { display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" },
      button: {
        padding: "10px 12px",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.18)",
        background: "rgba(255,255,255,0.08)",
        color: "#e9edf7",
        cursor: "pointer",
        fontWeight: 650,
      },
      buttonPrimary: {
        background: "linear-gradient(180deg, #7c5cff 0%, #5a3dff 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
      },
      buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
      nowPlayingLayout: {
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: 14,
        alignItems: "center",
      },
      artWrap: {
        width: 180,
        height: 180,
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.14)",
        background: "rgba(0,0,0,0.25)",
      },
      art: { width: "100%", height: "100%", objectFit: "cover" },
      song: { margin: 0, fontSize: 18, fontWeight: 800 },
      artist: { margin: "6px 0 0", opacity: 0.85 },
      album: { margin: "6px 0 0", opacity: 0.65, fontSize: 13 },
      link: { display: "inline-block", marginTop: 10, color: "#c7baff" },
      empty: { margin: 0, opacity: 0.75, lineHeight: 1.5 },
      footerHint: {
        marginTop: 14,
        fontSize: 12,
        opacity: 0.6,
      },

      // Mobile friendly: if screen is small, stack cards
      mobileGrid: {
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 16,
      },
    }),
    [isPlaying]
  );

  async function saveTag() {
    if (!uid.trim()) return alert("Please enter a UID.");
    if (!spotifyUrl.trim()) return alert("Please enter a Spotify URL/URI.");

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/tags/${uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotify_uri: spotifyUrl }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Save failed:", res.status, text);
        alert("Save failed. Check console.");
        return;
      }

      alert("Saved!");
    } catch (err) {
      console.error("Save crashed:", err);
      alert("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  }

  async function playTag() {
    if (!uid.trim()) return alert("Please enter a UID.");
    setPlaying(true);
    try {
      const res = await fetch(`${API}/api/play/${uid}`, { method: "POST" });
      if (!res.ok) {
        const text = await res.text();
        console.error("Play failed:", res.status, text);
        alert("Play failed. Check console.");
      }
    } catch (err) {
      console.error("Play crashed:", err);
      alert("Play failed. Check console.");
    } finally {
      setPlaying(false);
    }
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

  // simple responsive switch without CSS files:
  const isNarrow = typeof window !== "undefined" && window.innerWidth < 860;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>🎵 Recordify Player</h1>
            <p style={styles.subtitle}>
              RFID tags → Spotify playback. Live status below.
            </p>
          </div>
          <span style={styles.badge}>{isPlaying ? "▶ Playing" : "⏸ Paused"}</span>
        </div>

        <div style={isNarrow ? styles.mobileGrid : styles.grid}>
          {/* LEFT: Tag Editor */}
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <h2 style={styles.cardTitle}>Tag Editor</h2>
            </div>

            <div style={styles.field}>
              <div style={styles.label}>UID (your RFID tag id)</div>
              <input
                style={styles.input}
                placeholder="e.g. 04A1B2C3D4"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
              />
            </div>

            <div style={{ height: 12 }} />

            <div style={styles.field}>
              <div style={styles.label}>Spotify URL or URI</div>
              <input
                style={styles.input}
                placeholder="spotify:track:... or https://open.spotify.com/track/..."
                value={spotifyUrl}
                onChange={(e) => setSpotifyUrl(e.target.value)}
              />
            </div>

            <div style={styles.row}>
              <button
                style={{
                  ...styles.button,
                  ...(saving ? styles.buttonDisabled : {}),
                }}
                onClick={saveTag}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Tag"}
              </button>

              <button
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  ...(playing ? styles.buttonDisabled : {}),
                }}
                onClick={playTag}
                disabled={playing}
              >
                {playing ? "Playing..." : "Play Tag"}
              </button>
            </div>

            <div style={styles.footerHint}>
              Tip: paste a Spotify track link and hit “Save Tag”, then “Play Tag”.
            </div>
          </div>

          {/* RIGHT: Now Playing */}
          <div style={styles.card}>
            <div style={styles.cardTitleRow}>
              <h2 style={styles.cardTitle}>Now Playing</h2>
            </div>

            {item ? (
              <div style={styles.nowPlayingLayout}>
                <div style={styles.artWrap}>
                  <img
                    src={item.image_url}
                    alt="Album cover"
                    style={styles.art}
                  />
                </div>

                <div>
                  <p style={styles.song}>{item.name}</p>
                  <p style={styles.artist}>{item.artists}</p>
                  <p style={styles.album}>{item.album}</p>

                  {item.spotify_url ? (
                    <a
                      href={item.spotify_url}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.link}
                    >
                      Open in Spotify ↗
                    </a>
                  ) : null}
                </div>
              </div>
            ) : (
              <p style={styles.empty}>
                Nothing playing right now. Start a song in Spotify or tap “Play
                Tag”.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;