import { useState } from "react";
import "./App.css";

const API_URL = "https://api.alsana.site";

// Benzerlik mesafesini yüzdeye çevir (düşük mesafe = yüksek eşleşme)
function getMatchPercent(distance) {
  const percent = Math.max(0, Math.min(100, (1 - distance) * 100));
  return percent.toFixed(0);
}

// Marka adına göre ikon belirle
function getBrandIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("apple") || n.includes("mac")) return "🍎";
  if (n.includes("dell") || n.includes("alienware")) return "💻";
  if (n.includes("hp") || n.includes("hewlett")) return "🖥️";
  if (n.includes("lenovo") || n.includes("thinkpad")) return "💼";
  if (n.includes("asus") || n.includes("rog")) return "⚡";
  if (n.includes("acer")) return "🖱️";
  if (n.includes("msi")) return "🎮";
  if (n.includes("razer")) return "🐍";
  if (n.includes("surface") || n.includes("microsoft")) return "🪟";
  return "💻";
}

function App() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    setLoading(true);
    setResults([]);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/search?q=${encodeURIComponent(search.trim())}`,
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Sunucu hatası (${res.status})`);
      }

      const data = await res.json();
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error("Arama hatası:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Sunucuya bağlanılamadı. Backend çalışıyor mu?"
          : err.message,
      );
      setSearched(true);
    } finally {
      setLoading(false);
      setSearch("");
    }
  };

  const handleNewSearch = () => {
    window.location.reload();
  };

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Alsana</h1>
        <p className="subtitle">AI Destekli Bilgisayar Arama Platformu</p>
      </div>

      {!searched && (
        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Örn: Gaming Laptop, Office Computer, Budget PC..."
            className="search-input"
            disabled={loading}
            maxLength={200}
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? <span className="loader"></span> : "🔍"}
          </button>
        </form>
      )}

      {loading && (
        <div className="loading-state">
          <span className="loader-big"></span>
          <p className="loading-text">Aranıyor...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p className="error-text">⚠️ {error}</p>
          <button onClick={handleNewSearch} className="new-search-btn">
            Tekrar Dene
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-container">
          <div className="results-header">
            <h2>Önerilen Bilgisayarlar</h2>
            <button onClick={handleNewSearch} className="new-search-btn">
              Yeni Sorgu
            </button>
          </div>

          <div className="computers-grid">
            {results.map((item, index) => (
              <div
                key={index}
                className="computer-card"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="card-header">
                  <span className="icon">{getBrandIcon(item.name)}</span>
                  <span className="match-badge">
                    %{getMatchPercent(item.distance)} Eşleşme
                  </span>
                </div>
                <h3 className="computer-name">{item.name}</h3>
                <p className="specs">{item.description}</p>
                <div className="card-footer">
                  <div className="distance-bar">
                    <div
                      className="distance-fill"
                      style={{
                        width: `${getMatchPercent(item.distance)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searched && results.length === 0 && !error && !loading && (
        <div className="empty-state">
          <p>Sonuç bulunamadı. Farklı bir arama deneyin.</p>
          <button onClick={handleNewSearch} className="new-search-btn">
            Yeni Arama
          </button>
        </div>
      )}

      {!searched && !loading && (
        <div className="empty-state">
          <p>Bir bilgisayar aramaya başla →</p>
        </div>
      )}
    </div>
  );
}

export default App;
