// src/components/pin/PinModal.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { fetchUserBoards, savePin } from '../../hooks/usePins';
import CommentSection from '../comments/CommentSection';
import styles from './PinModal.module.css';

export default function PinModal({ pin, onClose }) {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [showBoards, setShowBoards] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!user) return;
    fetchUserBoards(user.id).then((data) => {
      setBoards(data ?? []);
      if (data?.length) setSelectedBoard(data[0]);
    });
  }, [user]);

  async function handleSave() {
    if (!user || !selectedBoard) return;
    setSaving(true);
    try {
      await savePin({
        boardId: selectedBoard.id,
        pinId: pin.id,
        userId: user.id,
      });
      setSaved(true);
    } catch {
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(pin.source_url || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isPortrait =
    pin.width && pin.height ? pin.height / pin.width > 1 : true;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`${styles.modal} ${isPortrait ? styles.portrait : styles.landscape}`}
      >
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label='Close'
        >
          <svg
            width='14'
            height='14'
            viewBox='0 0 14 14'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
          >
            <path d='M1 1l12 12M13 1L1 13' />
          </svg>
        </button>

        <div className={styles.imageCol}>
          <img
            src={pin.image_url}
            alt={pin.title || 'Pin'}
            className={styles.image}
          />
        </div>

        <div className={styles.detailCol}>
          <div className={styles.actionBar}>
            {user && (
              <div className={styles.saveGroup}>
                <div className={styles.boardSelector}>
                  <button
                    className={styles.boardToggle}
                    onClick={() => setShowBoards((o) => !o)}
                  >
                    <span>{selectedBoard?.name ?? 'Select board'}</span>
                    <svg
                      width='12'
                      height='12'
                      viewBox='0 0 12 12'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                    >
                      <path d='M2 4l4 4 4-4' />
                    </svg>
                  </button>
                  {showBoards && (
                    <div className={styles.boardDropdown}>
                      {boards.map((b) => (
                        <button
                          key={b.id}
                          className={`${styles.boardOpt} ${selectedBoard?.id === b.id ? styles.boardOptActive : ''}`}
                          onClick={() => {
                            setSelectedBoard(b);
                            setShowBoards(false);
                          }}
                        >
                          <span
                            className={styles.boardCover}
                            style={{
                              background: b.cover_url
                                ? `url(${b.cover_url}) center/cover`
                                : '#E8E2D9',
                            }}
                          />
                          {b.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  className={`${styles.saveBtn} ${saved ? styles.saveBtnSaved : ''}`}
                  onClick={handleSave}
                  disabled={saving || !selectedBoard}
                >
                  {saving ? '…' : saved ? 'Saved' : 'Save'}
                </button>
              </div>
            )}
            <button
              className={styles.iconBtn}
              onClick={handleCopy}
              title='Copy link'
            >
              {copied ? (
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#22c55e'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                >
                  <path d='M20 6L9 17l-5-5' />
                </svg>
              ) : (
                <svg
                  width='18'
                  height='18'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                >
                  <circle cx='18' cy='5' r='3' />
                  <circle cx='6' cy='12' r='3' />
                  <circle cx='18' cy='19' r='3' />
                  <path d='M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98' />
                </svg>
              )}
            </button>
          </div>

          {pin.source_url && (
            <a
              href={pin.source_url}
              target='_blank'
              rel='noopener noreferrer'
              className={styles.sourceLink}
            >
              <svg
                width='12'
                height='12'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              >
                <path d='M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6' />
                <polyline points='15 3 21 3 21 9' />
                <line x1='10' y1='14' x2='21' y2='3' />
              </svg>
              {(() => {
                try {
                  return new URL(pin.source_url).hostname.replace('www.', '');
                } catch {
                  return pin.source_url;
                }
              })()}
            </a>
          )}

          <div className={styles.content}>
            {pin.title && <h2 className={styles.title}>{pin.title}</h2>}
            {pin.description && (
              <p className={styles.description}>{pin.description}</p>
            )}
          </div>

          {pin.tags?.length > 0 && (
            <div className={styles.tags}>
              {pin.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className={styles.stats}>
            <span className={styles.stat}>
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              >
                <path d='M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z' />
              </svg>
              {pin.save_count ?? 0} saves
            </span>
          </div>

          <div className={styles.author}>
            <div
              className={styles.avatar}
              style={{
                backgroundImage: pin.avatar_url
                  ? `url(${pin.avatar_url})`
                  : 'none',
                backgroundSize: 'cover',
              }}
            >
              {!pin.avatar_url && (pin.username?.[0] ?? '?').toUpperCase()}
            </div>
            <div>
              <p className={styles.authorName}>
                {pin.display_name || pin.username}
              </p>
              <p className={styles.authorHandle}>@{pin.username}</p>
            </div>
            {user && pin.user_id !== user.id && (
              <button className={styles.followBtn}>Follow</button>
            )}
          </div>

          <CommentSection pinId={pin.id} />
        </div>
      </div>
    </div>
  );
}
