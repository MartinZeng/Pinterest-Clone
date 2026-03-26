// src/components/layout/Navbar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationsPanel from '../notifications/NotificationsPanel';
import styles from './Navbar.module.css';

export default function Navbar({ onSearch }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications(user?.id);

  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) onSearch?.(query.trim());
  }

  function handleSearchChange(e) {
    setQuery(e.target.value);
    if (!e.target.value.trim()) onSearch?.('');
  }

  const initials = profile?.display_name
    ? profile.display_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (profile?.username?.[0]?.toUpperCase() ?? '?');

  return (
    <>
      <nav className={styles.nav}>
        <button
          className={styles.hamburger}
          onClick={() => setDrawerOpen(true)}
          aria-label='Open menu'
        >
          <span />
          <span />
          <span />
        </button>

        <button
          className={styles.logo}
          onClick={() => navigate('/')}
          aria-label='Home'
        >
          <svg width='28' height='28' viewBox='0 0 36 36' fill='none'>
            <circle cx='18' cy='18' r='18' fill='#E63946' />
            <path
              d='M18 8C14.13 8 11 11.13 11 15c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
              fill='white'
            />
          </svg>
          <span className={styles.logoText}>Pinboard</span>
        </button>

        <div className={styles.navLinks}>
          <button
            className={`${styles.navLink} ${location.pathname === '/' ? styles.navLinkActive : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>
          <button
            className={`${styles.navLink} ${location.pathname === '/explore' ? styles.navLinkActive : ''}`}
            onClick={() => navigate('/explore')}
          >
            Explore
          </button>
        </div>

        <form className={styles.searchForm} onSubmit={handleSearch}>
          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='11' cy='11' r='8' />
              <path d='m21 21-4.35-4.35' />
            </svg>
            <input
              className={styles.searchInput}
              type='search'
              placeholder='Search for ideas…'
              value={query}
              onChange={handleSearchChange}
            />
            {query && (
              <button
                type='button'
                className={styles.clearBtn}
                onClick={() => {
                  setQuery('');
                  onSearch?.('');
                }}
              >
                ✕
              </button>
            )}
          </div>
        </form>

        <div className={styles.actions}>
          <button
            className={styles.createBtn}
            onClick={() => navigate('/create')}
          >
            + Create
          </button>

          <div className={styles.iconWrap} ref={notifRef}>
            <button
              className={styles.iconBtn}
              onClick={() => setNotifOpen((o) => !o)}
              aria-label='Notifications'
            >
              <svg
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9' />
                <path d='M13.73 21a2 2 0 0 1-3.46 0' />
              </svg>
              {unreadCount > 0 && (
                <span className={styles.badge}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className={styles.notifDropdown}>
                <NotificationsPanel onClose={() => setNotifOpen(false)} />
              </div>
            )}
          </div>

          <div className={styles.iconWrap} ref={menuRef}>
            <button
              className={styles.avatarBtn}
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                backgroundImage: profile?.avatar_url
                  ? `url(${profile.avatar_url})`
                  : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {!profile?.avatar_url && initials}
            </button>
            {menuOpen && (
              <div className={`${styles.dropdown} ${styles.dropdownRight}`}>
                <div className={styles.menuProfile}>
                  <p className={styles.menuName}>
                    {profile?.display_name || profile?.username}
                  </p>
                  <p className={styles.menuEmail}>{user?.email}</p>
                </div>
                <hr className={styles.menuDivider} />
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    navigate(`/profile/${profile?.username}`);
                    setMenuOpen(false);
                  }}
                >
                  Your profile
                </button>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    navigate('/explore');
                    setMenuOpen(false);
                  }}
                >
                  Explore
                </button>
                <hr className={styles.menuDivider} />
                <button
                  className={`${styles.menuItem} ${styles.menuItemDanger}`}
                  onClick={signOut}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {drawerOpen && (
        <div className={styles.backdrop} onClick={() => setDrawerOpen(false)} />
      )}

      <div
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.drawerProfile}>
            <div
              className={styles.drawerAvatar}
              style={{
                backgroundImage: profile?.avatar_url
                  ? `url(${profile.avatar_url})`
                  : 'none',
                backgroundSize: 'cover',
              }}
            >
              {!profile?.avatar_url && initials}
            </div>
            <div>
              <p className={styles.drawerName}>
                {profile?.display_name || profile?.username}
              </p>
              <p className={styles.drawerEmail}>{user?.email}</p>
            </div>
          </div>
          <button
            className={styles.drawerClose}
            onClick={() => setDrawerOpen(false)}
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              stroke='currentColor'
              strokeWidth='2.5'
              strokeLinecap='round'
            >
              <path d='M1 1l14 14M15 1L1 15' />
            </svg>
          </button>
        </div>
        <nav className={styles.drawerNav}>
          <button className={styles.drawerItem} onClick={() => navigate('/')}>
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' />
              <polyline points='9 22 9 12 15 12 15 22' />
            </svg>
            Home
          </button>
          <button
            className={styles.drawerItem}
            onClick={() => navigate('/explore')}
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='12' r='10' />
              <polygon points='16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76' />
            </svg>
            Explore
          </button>
          <button
            className={styles.drawerItem}
            onClick={() => navigate('/create')}
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            >
              <line x1='12' y1='5' x2='12' y2='19' />
              <line x1='5' y1='12' x2='19' y2='12' />
            </svg>
            Create pin
          </button>
          <button
            className={styles.drawerItem}
            onClick={() => navigate(`/profile/${profile?.username}`)}
          >
            <svg
              width='18'
              height='18'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            >
              <path d='M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' />
              <circle cx='12' cy='7' r='4' />
            </svg>
            Your profile
          </button>
        </nav>
        <div className={styles.drawerFooter}>
          <button className={styles.drawerSignOut} onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}
