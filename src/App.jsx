import { useState } from 'react'
import './App.css'

const mockComputers = [
  {
    id: 1,
    name: 'MacBook Pro 16"',
    specs: 'M3 Max, 36GB RAM, 512GB SSD',
    price: '$3,499',
    category: 'Laptop',
    icon: '💻'
  },
  {
    id: 2,
    name: 'Dell XPS 15',
    specs: 'RTX 4090, Intel i9, 32GB RAM, 1TB SSD',
    price: '$2,799',
    category: 'Gaming Laptop',
    icon: '🎮'
  },
  {
    id: 3,
    name: 'Thinkpad X1 Carbon',
    specs: 'Intel i7, 16GB RAM, 512GB SSD, 14" Display',
    price: '$1,599',
    category: 'Business',
    icon: '💼'
  }
]

function App() {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!search.trim()) return

    setLoading(true)
    setResults([])

    // Simulate API call with 2-3 second delay
    setTimeout(() => {
      setResults(mockComputers)
      setLoading(false)
      setSearched(true)
    }, 2000)

    setSearch('')
  }

  const handleNewSearch = () => {
    setSearch('')
    setResults([])
    setSearched(false)
  }

  return (
    <div className="app">
      <div className="header">
        <h1 className="title">Alsana</h1>
        <p className="subtitle">AI Destekli Bilgisayar Arama Platformu</p>
      </div>

      <form onSubmit={handleSearch} className="search-container">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Örn: Gaming Laptop, 32GB RAM, Ucuz..."
          className="search-input"
          disabled={loading}
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? (
            <span className="loader"></span>
          ) : (
            '🔍'
          )}
        </button>
      </form>

      {loading && (
        <div className="loading-state">
          <div className="thinking">
            <div className="pulse"></div>
            <p>AI'ya soruluyor...</p>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="results-container">
          <div className="results-header">
            <h2>Önerilen Bilgisayarlar</h2>
            <button 
              onClick={handleNewSearch} 
              className="new-search-btn"
            >
              + Yeni Arama
            </button>
          </div>

          <div className="computers-grid">
            {results.map((computer, index) => (
              <div
                key={computer.id}
                className="computer-card"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="card-header">
                  <span className="icon">{computer.icon}</span>
                  <span className="category">{computer.category}</span>
                </div>
                <h3 className="computer-name">{computer.name}</h3>
                <p className="specs">{computer.specs}</p>
                <div className="card-footer">
                  <span className="price">{computer.price}</span>
                  <button className="view-btn">Detay</button>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSearch} className="follow-up-container">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Başka bir arama yap..."
              className="search-input"
              disabled={loading}
            />
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? (
                <span className="loader"></span>
              ) : (
                '🔍'
              )}
            </button>
          </form>
        </div>
      )}

      {!searched && !loading && (
        <div className="empty-state">
          <p>Bir bilgisayar aramaya başla →</p>
        </div>
      )}
    </div>
  )
}

export default App
