// src/components/feed/PinCard.jsx
// Pin card with hover overlay, save button, and heart like button.

import { useState, useRef } from 'react';
import { useAuth } from '../../lib/auth';
import { fetchUserBoards, savePin } from '../../hooks/usePins';
import { useLike } from '../../hooks/useLike';
import styles from './PinCard.module.css';

export default function PinCard({ pin, onClick }) {
  const { user } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [boards, setBoards] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const cardRef = useRef(null);

  const { liked, likeCount, toggleLike } = useLike(pin.id, pin.like_count ?? 0);

  async function handleSaveClick(e) {
    e.stopPropagation();
    if (!user) return;
    setErrorMsg(null); // ← clear on reopen
    setSaving(true);
    try {
      const userBoards = await fetchUserBoards(user.id);
      setBoards(userBoards);
      setShowPicker(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleBoardSelect(e, boardId) {
    e.stopPropagation();
    setSaving(true);
    setErrorMsg(null);
    try {
      await savePin({ boardId, pinId: pin.id, userId: user.id });
      setSaved(true);
      setShowPicker(false);
    } catch (err) {
      // Supabase unique constraint violation code is '23505'
      if (err?.code === '23505' || err?.message?.includes('unique')) {
        setErrorMsg('Already saved to this board');
      } else {
        setErrorMsg('Something went wrong');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleLike(e) {
    e.stopPropagation();
    await toggleLike();
  }

  const aspectRatio = pin.width && pin.height ? pin.height / pin.width : 1.3;
  const placeholderHeight = Math.round(236 * aspectRatio);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setShowPicker(false);
      }}
      onClick={() => onClick?.(pin)}
    >
      <div
        className={styles.imageWrap}
        style={{
          minHeight: imgLoaded ? 'unset' : placeholderHeight,
          background: pin.color || '#E8E2D9',
        }}
      >
        <img
          src={pin.thumb_url || pin.image_url}
          alt={pin.title || 'Pin'}
          className={`${styles.image} ${imgLoaded ? styles.imageLoaded : ''}`}
          onLoad={() => setImgLoaded(true)}
          loading='lazy'
        />

        {hovered && (
          <div className={styles.overlay}>
            {/* Top row: save button */}
            {user && (
              <div className={styles.overlayTop}>
                <button
                  className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
                  onClick={handleSaveClick}
                  disabled={saving}
                >
                  {saving ? '…' : saved ? 'Saved' : 'Save'}
                </button>
              </div>
            )}

            {/* Bottom row: like button + more */}
            <div className={styles.overlayBottom}>
              <button
                className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ''}`}
                onClick={handleLike}
                title={liked ? 'Unlike' : 'Like'}
              >
                <HeartIcon filled={liked} />
                {likeCount > 0 && (
                  <span className={styles.likeCount}>{likeCount}</span>
                )}
              </button>
              <button
                className={styles.moreBtn}
                onClick={(e) => e.stopPropagation()}
                title='More options'
              >
                •••
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Board picker */}
      {showPicker && boards.length > 0 && (
        <div
          className={styles.boardPicker}
          onClick={(e) => e.stopPropagation()}
        >
          <p className={styles.pickerLabel}>Save to board</p>

          {errorMsg && <p className={styles.pickerError}>{errorMsg}</p>}

          {boards.map((board) => (
            <button
              key={board.id}
              className={styles.boardOption}
              onClick={(e) => handleBoardSelect(e, board.id)}
            >
              <span
                className={styles.boardThumb}
                style={{
                  background: board.cover_url
                    ? `url(${board.cover_url}) center/cover`
                    : '#E8E2D9',
                }}
              />
              <span className={styles.boardName}>{board.name}</span>
              <span className={styles.boardCount}>{board.pin_count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card footer */}
      <div className={styles.footer}>
        {pin.title && <p className={styles.title}>{pin.title}</p>}
        <div className={styles.author}>
          <div
            className={styles.avatar}
            style={{
              background: pin.avatar_url
                ? `url(${pin.avatar_url}) center/cover`
                : '#E8E2D9',
            }}
          />
          <span className={styles.username}>
            {pin.display_name || pin.username || 'Pinboard'}
          </span>
        </div>
      </div>
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill={filled ? 'currentColor' : 'none'}
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' />
    </svg>
  );
}
