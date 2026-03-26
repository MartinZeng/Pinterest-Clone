// src/components/comments/CommentSection.jsx
import { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { useComments } from '../../hooks/useComments';
import styles from './CommentSection.module.css';

export default function CommentSection({ pinId }) {
  const { user, profile } = useAuth();
  const { comments, loading, addComment, deleteComment } = useComments(pinId);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim() || posting) return;
    setPosting(true);
    try {
      await addComment(body);
      setBody('');
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className={styles.root}>
      <p className={styles.heading}>
        {comments.length > 0
          ? `${comments.length} comment${comments.length !== 1 ? 's' : ''}`
          : 'Comments'}
      </p>

      {/* Comment list */}
      <div className={styles.list}>
        {loading && <p className={styles.loadingText}>Loading…</p>}
        {!loading && comments.length === 0 && (
          <p className={styles.emptyText}>No comments yet — be the first!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className={styles.comment}>
            <div
              className={styles.avatar}
              style={{
                backgroundImage: c.avatar_url ? `url(${c.avatar_url})` : 'none',
                backgroundSize: 'cover',
              }}
            >
              {!c.avatar_url && (c.username?.[0] ?? '?').toUpperCase()}
            </div>
            <div className={styles.commentBody}>
              <div className={styles.commentMeta}>
                <span className={styles.commentAuthor}>
                  {c.display_name || c.username}
                </span>
                <span className={styles.commentTime}>
                  {timeAgo(c.created_at)}
                </span>
              </div>
              <p className={styles.commentText}>{c.body}</p>
            </div>
            {user?.id === c.user_id && (
              <button
                className={styles.deleteBtn}
                onClick={() => deleteComment(c.id)}
                title='Delete comment'
              >
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                >
                  <path d='M18 6L6 18M6 6l12 12' />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      {user ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div
            className={styles.inputAvatar}
            style={{
              backgroundImage: profile?.avatar_url
                ? `url(${profile.avatar_url})`
                : 'none',
              backgroundSize: 'cover',
            }}
          >
            {!profile?.avatar_url &&
              (profile?.username?.[0] ?? '?').toUpperCase()}
          </div>
          <input
            className={styles.input}
            type='text'
            placeholder='Add a comment…'
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
          />
          {body.trim() && (
            <button className={styles.postBtn} type='submit' disabled={posting}>
              {posting ? '…' : 'Post'}
            </button>
          )}
        </form>
      ) : (
        <p className={styles.signInPrompt}>Sign in to leave a comment</p>
      )}
    </div>
  );
}
