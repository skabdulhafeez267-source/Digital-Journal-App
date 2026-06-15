import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';

const EntryForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState('neutral');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchEntry = async () => {
        try {
          const { data } = await api.get(`/entries/${id}`);
          setTitle(data.title);
          setContent(data.content);
          setMood(data.mood);
          setTags(data.tags.join(', '));
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load entry');
        } finally {
          setFetching(false);
        }
      };
      fetchEntry();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    try {
      if (isEdit) {
        await api.put(`/entries/${id}`, { title, content, mood, tags: tagsArray });
      } else {
        await api.post('/entries', { title, content, mood, tags: tagsArray });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="container"><p>Loading entry...</p></div>;

  return (
    <div className="container">
      <h1>{isEdit ? 'Edit Entry' : 'New Journal Entry'}</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <form className="entry-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Give your entry a title"
            required
          />
        </div>

        <div className="form-group">
          <label>How are you feeling?</label>
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="happy">😊 Happy</option>
            <option value="sad">😢 Sad</option>
            <option value="neutral">😐 Neutral</option>
            <option value="excited">🤩 Excited</option>
            <option value="angry">😠 Angry</option>
            <option value="anxious">😰 Anxious</option>
            <option value="grateful">🙏 Grateful</option>
          </select>
        </div>

        <div className="form-group">
          <label>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            rows={10}
            required
          />
        </div>

        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. work, travel, family"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : isEdit ? 'Update Entry' : 'Save Entry'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;
