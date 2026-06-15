import { Link } from 'react-router-dom';

const moodEmojis = {
  happy: '😊',
  sad: '😢',
  neutral: '😐',
  excited: '🤩',
  angry: '😠',
  anxious: '😰',
  grateful: '🙏',
};

const EntryCard = ({ entry, onDelete, onToggleFavorite }) => {
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="entry-card">
      <div className="entry-card-header">
        <h3>{entry.title}</h3>
        <span className="mood-badge">{moodEmojis[entry.mood] || '😐'} {entry.mood}</span>
      </div>
      <p className="entry-date">{date}</p>
      <p className="entry-preview">
        {entry.content.length > 150 ? `${entry.content.substring(0, 150)}...` : entry.content}
      </p>
      {entry.tags && entry.tags.length > 0 && (
        <div className="entry-tags">
          {entry.tags.map((tag, idx) => (
            <span key={idx} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="entry-card-actions">
        <button
          className={`btn-icon ${entry.favorite ? 'favorite-active' : ''}`}
          onClick={() => onToggleFavorite(entry)}
          title="Toggle favorite"
        >
          {entry.favorite ? '⭐' : '☆'}
        </button>
        <Link to={`/edit/${entry._id}`} className="btn btn-small">
          Edit
        </Link>
        <button className="btn btn-small btn-danger" onClick={() => onDelete(entry._id)}>
          Delete
        </button>
      </div>
    </div>
  );
};

export default EntryCard;
