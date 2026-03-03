import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_URL = "https://api.alsana.site";
//const API_URL = "http://localhost:5000";

// Benzerlik mesafesini yüzdeye çevir (düşük mesafe = yüksek eşleşme)
function getMatchPercent(distance) {
  const rawPercent = (1 - distance) * 100;
  // 50-80 aralığını 0-100 aralığına normalize ediyoruz
  const scaledPercent = ((rawPercent - 50) / (80 - 50)) * 100;
  return Math.max(0, Math.min(100, scaledPercent)).toFixed(0);
}

// Marka adına göre ikon belirle
function getBrandIcon(name) {
  if (!name) return "💻";
  const n = name.toLowerCase();
  if (n.includes("apple") || n.includes("mac")) return "🍎";
  if (n.includes("dell") || n.includes("alienware")) return "💻";
  if (n.includes("hp") || n.includes("hewlett")) return "🖥️";
  if (n.includes("lenovo") || n.includes("thinkpad")) return "💼";
  if (n.includes("asus") || n.includes("rog") || n.includes("tuf")) return "⚡";
  if (n.includes("acer")) return "🖱️";
  if (n.includes("msi") || n.includes("katana")) return "🎮";
  if (n.includes("razer")) return "🐍";
  if (n.includes("surface") || n.includes("microsoft")) return "🪟";
  return "💻";
}

const CPU_OPTIONS = ["AMD", "Intel"];
const GPU_OPTIONS = ["NVIDIA", "AMD"];

function App() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cpuFilter, setCpuFilter] = useState("");
  const [gpuFilter, setGpuFilter] = useState("");

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [chatError, setChatError] = useState("");
  const chatEndRef = useRef(null);

  // Chat mesajları güncellenince en alta kaydır
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    const searchQuery = search.trim();
    setLoading(true);
    setResults([]);
    setError("");
    setChatMessages([]);
    setSessionId("");
    setChatError("");

    try {
      const params = new URLSearchParams({ q: searchQuery });
      if (cpuFilter) params.set("cpuType", cpuFilter);
      if (gpuFilter) params.set("gpuType", gpuFilter);

      const res = await fetch(`${API_URL}/search?${params.toString()}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Sunucu hatası (${res.status})`);
      }

      const data = await res.json();
      setResults(data.products || []);
      if (data.sessionId) setSessionId(data.sessionId);
      setSearched(true);
      setSearch("");
      setLoading(false);

      // Sonuçlar geldiyse RAG chat'i başlat
      if (data.products && data.products.length > 0) {
        setChatLoading(true);
        try {
          const chatRes = await fetch(`${API_URL}/chat/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: data.sessionId, query: searchQuery }),
          });

          if (!chatRes.ok) {
            const chatData = await chatRes.json().catch(() => ({}));
            throw new Error(chatData.error || "Chat başlatılamadı");
          }

          const chatData = await chatRes.json();
          setChatMessages([
            { role: "user", content: searchQuery },
            { role: "assistant", content: chatData.response },
          ]);
        } catch (chatErr) {
          console.error("Chat başlatma hatası:", chatErr);
          setChatError(
            "AI asistan başlatılamadı. Ürün sonuçları yine de görüntülenebilir.",
          );
        } finally {
          setChatLoading(false);
        }
      }
    } catch (err) {
      console.error("Arama hatası:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Sunucuya bağlanılamadı. Backend çalışıyor mu?"
          : err.message,
      );
      setSearched(true);
      setSearch("");
      setLoading(false);
    }
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !sessionId || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage },
    ]);
    setChatLoading(true);
    setChatError("");

    try {
      const res = await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, query: userMessage }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Yanıt alınamadı");
      }

      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      console.error("Chat mesaj hatası:", err);
      setChatError("Yanıt alınırken hata oluştu. Tekrar deneyin.");
    } finally {
      setChatLoading(false);
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
        <>
          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label" htmlFor="cpu-filter">
                İşlemci
              </label>
              <select
                id="cpu-filter"
                className="filter-select"
                value={cpuFilter}
                onChange={(e) => setCpuFilter(e.target.value)}
                disabled={loading}
              >
                <option value="">Tümü</option>
                {CPU_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label" htmlFor="gpu-filter">
                Ekran Kartı
              </label>
              <select
                id="gpu-filter"
                className="filter-select"
                value={gpuFilter}
                onChange={(e) => setGpuFilter(e.target.value)}
                disabled={loading}
              >
                <option value="">Tümü</option>
                {GPU_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
        </>
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
        <div className="main-content">
          <div className="results-container">
            <div className="results-header">
              <h2>Önerilen Bilgisayarlar</h2>
              <button onClick={handleNewSearch} className="new-search-btn">
                Yeni Sorgu
              </button>
            </div>

            <div className="computers-grid">
              {results.map((item, index) => (
                <div key={index} className="computer-card">
                  <div className="card-header">
                    <span className="icon">
                      {getBrandIcon(item.product_name)}
                    </span>
                    <span className="match-badge">
                      %{getMatchPercent(item.distance)} Eşleşme
                    </span>
                  </div>
                  <h3 className="computer-name">{item.product_name}</h3>
                  <p className="price">{item.price}</p>
                  <div className="card-footer">
                    <div className="distance-bar">
                      <div
                        className="distance-fill"
                        style={{
                          width: `${getMatchPercent(item.distance)}%`,
                        }}
                      ></div>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        Ürüne Git →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="chat-panel">
            <div className="chat-header">
              <span className="chat-header-icon">🤖</span>
              <span className="chat-header-title">AI Asistan</span>
            </div>

            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role}`}>
                  {msg.role === "assistant" && (
                    <span className="bubble-icon">🤖</span>
                  )}
                  <div className="bubble-content">{msg.content}</div>
                </div>
              ))}

              {chatLoading && (
                <div className="chat-bubble assistant">
                  <span className="bubble-icon">🤖</span>
                  <div className="bubble-content">
                    <span className="chat-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                  </div>
                </div>
              )}

              {chatError && <div className="chat-error">{chatError}</div>}

              <div ref={chatEndRef} />
            </div>

            {sessionId && (
              <form onSubmit={handleChatSend} className="chat-input-container">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Takip sorusu sor..."
                  className="chat-input"
                  disabled={chatLoading}
                  maxLength={500}
                />
                <button
                  type="submit"
                  className="chat-send-btn"
                  disabled={chatLoading || !chatInput.trim()}
                >
                  ➤
                </button>
              </form>
            )}
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
