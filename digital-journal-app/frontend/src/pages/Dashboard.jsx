import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import EntryCard from '../components/EntryCard';

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState('');
  const [mood, setMood] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 6 };
      if (search) params.search = search;
      if (mood) params.mood = mood;
      if (favoriteOnly) params.favorite = true;

      const { data } = await api.get('/entries', { params });
      setEntries(data.entries);
      setPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  }, [search, mood, favoriteOnly, page]);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get('/entries/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      await api.delete(`/entries/${id}`);
      setEntries((prev) => prev.filter((e) => e._id !== id));
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete entry');
    }
  };

  const handleToggleFavorite = async (entry) => {
    try {
      const { data } = await api.put(`/entries/${entry._id}`, {
        favorite: !entry.favorite,
      });
      setEntries((prev) => prev.map((e) => (e._id === entry._id ? data : e)));
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update entry');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEntries();
  };

  return (
    <div className="container">
      <h1>My Journal</h1>

      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Entries</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.favoriteCount}</span>
            <span className="stat-label">Favorites</span>
          </div>
        </div>
      )}

      <form className="filters" onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Search entries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={mood} onChange={(e) => { setMood(e.target.value); setPage(1); }}>
          <option value="">All Moods</option>
          <option value="happy">😊 Happy</option>
          <option value="sad">😢 Sad</option>
          <option value="neutral">😐 Neutral</option>
          <option value="excited">🤩 Excited</option>
          <option value="angry">😠 Angry</option>
          <option value="anxious">😰 Anxious</option>
          <option value="grateful">🙏 Grateful</option>
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={favoriteOnly}
            onChange={(e) => { setFavoriteOnly(e.target.checked); setPage(1); }}
          />
          Favorites only
        </label>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <p>Loading entries...</p>
      ) : entries.length === 0 ? (
        <p className="empty-state">No journal entries found. Start writing today!</p>
      ) : (
        <>
          <div className="entries-grid">
            {entries.map((entry) => (
              <EntryCard
                key={entry._id}
                entry={entry}
                onDelete={handleDelete}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span>Page {page} of {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
