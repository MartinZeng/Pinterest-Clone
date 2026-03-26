// src/components/notifications/NotificationsPanel.jsx
// Dropdown panel showing realtime notifications with mark-as-read.

import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../hooks/useNotifications';
import styles from './NotificationsPanel.module.css';

export default function NotificationsPanel({ onClose }) {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markAllRead, markOneRead } =
    useNotifications(user?.id);
  const navigate = useNavigate();

  function handleClick(notif) {
    markOneRead(notif.id);
    if (notif.pin_id) {
      onClose?.();
      // In a fuller app you'd open the pin modal; for now navigate to feed
      navigate('/');
    } else if (notif.type === 'new_follower' && notif.actor?.username) {
      onClose?.();
      navigate(`/profile/${notif.actor.username}`);
    }
  }

  function getMessage(notif) {
    const actor =
      notif.actor?.display_name || notif.actor?.username || 'Someone';
    switch (notif.type) {
      case 'pin_saved':
        return `${actor} saved your pin`;
      case 'pin_liked':
        return `${actor} liked your pin`;
      case 'pin_commented':
        return `${actor} commented on your pin`;
      case 'new_follower':
        return `${actor} started following you`;
      default:
        return `${actor} interacted with your content`;
    }
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.title}>Notifications</p>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllRead}>
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.list}>
        {loading && <div className={styles.empty}>Loading…</div>}
        {!loading && notifications.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔔</span>
            <p>No notifications yet</p>
          </div>
        )}
        {notifications.map((notif) => (
          <button
            key={notif.id}
            className={`${styles.item} ${!notif.is_read ? styles.itemUnread : ''}`}
            onClick={() => handleClick(notif)}
          >
            {/* Actor avatar */}
            <div
              className={styles.actorAvatar}
              style={{
                backgroundImage: notif.actor?.avatar_url
                  ? `url(${notif.actor.avatar_url})`
                  : 'none',
                backgroundSize: 'cover',
              }}
            >
              {!notif.actor?.avatar_url &&
                (notif.actor?.username?.[0] ?? '?').toUpperCase()}
            </div>

            {/* Text */}
            <div className={styles.itemContent}>
              <p className={styles.itemMsg}>{getMessage(notif)}</p>
              <p className={styles.itemTime}>{timeAgo(notif.created_at)}</p>
            </div>

            {/* Pin thumbnail */}
            {notif.pin?.thumb_url && (
              <div
                className={styles.pinThumb}
                style={{
                  backgroundImage: `url(${notif.pin.thumb_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
            )}

            {/* Unread dot */}
            {!notif.is_read && <div className={styles.unreadDot} />}
          </button>
        ))}
      </div>
    </div>
  );
}
