// src/components/boards/BoardsGrid.jsx
// Displays a user's boards as cards. Owners can create and delete boards.

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import styles from './BoardsGrid.module.css';

export default function BoardsGrid({ userId, isOwner }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrivate, setNewPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!userId) return;
    supabase
      .from('boards_with_stats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setBoards(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim() || !user) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert({
          user_id: user.id,
          name: newName.trim(),
          is_private: newPrivate,
        })
        .select()
        .single();
      if (error) throw error;
      setBoards((prev) => [...prev, data]);
      setNewName('');
      setNewPrivate(false);
      setCreating(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(boardId) {
    try {
      await supabase.from('boards').delete().eq('id', boardId);
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
      setDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <div className={styles.loading}>Loading boards…</div>;

  return (
    <div className={styles.root}>
      {/* Create board button */}
      {isOwner && (
        <div className={styles.createWrap}>
          {creating ? (
            <form className={styles.createForm} onSubmit={handleCreate}>
              <input
                className={styles.createInput}
                type='text'
                placeholder='Board name'
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                maxLength={50}
              />
              <label className={styles.privateLabel}>
                <input
                  type='checkbox'
                  checked={newPrivate}
                  onChange={(e) => setNewPrivate(e.target.checked)}
                />
                Keep this board private
              </label>
              <div className={styles.createActions}>
                <button
                  type='button'
                  className={styles.cancelBtn}
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className={styles.saveBtn}
                  disabled={saving || !newName.trim()}
                >
                  {saving ? '…' : 'Create'}
                </button>
              </div>
            </form>
          ) : (
            <button
              className={styles.newBoardBtn}
              onClick={() => setCreating(true)}
            >
              <span className={styles.plusIcon}>+</span>
              Create board
            </button>
          )}
        </div>
      )}

      {/* Boards grid */}
      {boards.length === 0 && !creating ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📋</span>
          <p>No boards yet{isOwner ? ' — create one above!' : '.'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {boards.map((board) => (
            <div key={board.id} className={styles.boardCard}>
              {/* Delete confirm overlay */}
              {deleteId === board.id && (
                <div className={styles.deleteOverlay}>
                  <p className={styles.deleteMsg}>Delete "{board.name}"?</p>
                  <div className={styles.deleteActions}>
                    <button
                      className={styles.deleteCancelBtn}
                      onClick={() => setDeleteId(null)}
                    >
                      Cancel
                    </button>
                    <button
                      className={styles.deleteConfirmBtn}
                      onClick={() => handleDelete(board.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {/* Cover images — show up to 3 */}
              <div
                className={styles.boardCover}
                onClick={() => navigate(`/board/${board.id}`)}
              >
                {board.cover_url ? (
                  <img
                    src={board.cover_url}
                    alt={board.name}
                    className={styles.coverImg}
                  />
                ) : (
                  <div className={styles.coverEmpty}>
                    <svg
                      width='24'
                      height='24'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <rect x='3' y='3' width='18' height='18' rx='2' />
                      <path d='M3 9h18M9 21V9' />
                    </svg>
                  </div>
                )}
                {board.is_private && (
                  <div className={styles.privateBadge}>
                    <svg
                      width='10'
                      height='10'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                    >
                      <path d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' />
                    </svg>
                  </div>
                )}
              </div>

              {/* Board info */}
              <div className={styles.boardInfo}>
                <p className={styles.boardName}>{board.name}</p>
                <p className={styles.boardCount}>{board.pin_count ?? 0} pins</p>
              </div>

              {/* Owner controls */}
              {isOwner && (
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(board.id);
                  }}
                  title='Delete board'
                >
                  <svg
                    width='14'
                    height='14'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <polyline points='3 6 5 6 21 6' />
                    <path d='M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6' />
                    <path d='M10 11v6M14 11v6' />
                    <path d='M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2' />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
