// src/pages/ProfilePage.jsx
// User profile: avatar, stats, boards grid, pins grid, edit mode.

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import MasonryGrid from '../components/feed/MasonryGrid';
import PinModal from '../components/pin/PinModal';
import BoardsGrid from '../components/boards/BoardsGrid';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { username } = useParams();
  const { user, profile: myProfile, updateProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('created'); // 'created' | 'saved' | 'boards'
  const [selectedPin, setSelectedPin] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwner = user && myProfile?.username === username;

  // Load profile
  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      setProfile(data);
      setEditName(data?.display_name || '');
      setEditBio(data?.bio || '');
      setLoading(false);
    }
    if (username) load();
  }, [username]);

  // Load pins for current tab
  useEffect(() => {
    if (!profile) return;
    async function loadPins() {
      if (tab === 'created') {
        const { data } = await supabase
          .from('pins_with_author')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });
        setPins(data ?? []);
      } else if (tab === 'saved') {
        const { data } = await supabase
          .from('board_pins')
          .select('pin:pin_id(*), pins_with_author!inner(*)')
          .eq('saved_by', profile.id)
          .order('saved_at', { ascending: false });
        setPins(data?.map((d) => d['pins_with_author']) ?? []);
      }
    }
    if (tab !== 'boards') loadPins();
  }, [profile, tab]);

  async function handleSaveProfile() {
    setSaving(true);
    try {
      await updateProfile({ display_name: editName, bio: editBio });
      setProfile((p) => ({ ...p, display_name: editName, bio: editBio }));
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState />;

  if (!profile)
    return (
      <div className={styles.root}>
        <Navbar />
        <div className={styles.notFound}>Profile not found.</div>
      </div>
    );

  const initials = profile.display_name
    ? profile.display_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (profile.username?.[0]?.toUpperCase() ?? '?');

  return (
    <div className={styles.root}>
      <Navbar />

      <main className={styles.main}>
        {/* Profile header */}
        <div className={styles.header}>
          <div
            className={styles.avatar}
            style={{
              backgroundImage: profile.avatar_url
                ? `url(${profile.avatar_url})`
                : 'none',
              backgroundSize: 'cover',
            }}
          >
            {!profile.avatar_url && initials}
          </div>

          {editing ? (
            <div className={styles.editForm}>
              <input
                className={styles.editInput}
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder='Display name'
              />
              <textarea
                className={`${styles.editInput} ${styles.editTextarea}`}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder='Write a short bio…'
                rows={2}
              />
              <div className={styles.editActions}>
                <button
                  className={styles.cancelEditBtn}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  className={styles.saveEditBtn}
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? '…' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <h1 className={styles.displayName}>
                {profile.display_name || profile.username}
              </h1>
              <p className={styles.handle}>@{profile.username}</p>
              {profile.bio && <p className={styles.bio}>{profile.bio}</p>}

              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>
                    {profile.follower_count ?? 0}
                  </span>
                  <span className={styles.statLabel}>followers</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>
                    {profile.following_count ?? 0}
                  </span>
                  <span className={styles.statLabel}>following</span>
                </div>
              </div>

              {isOwner ? (
                <button
                  className={styles.editBtn}
                  onClick={() => setEditing(true)}
                >
                  Edit profile
                </button>
              ) : (
                <button className={styles.followBtn}>Follow</button>
              )}
            </>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          {['created', 'saved', 'boards'].map((t) => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'boards' ? (
          <BoardsGrid userId={profile.id} isOwner={isOwner} />
        ) : (
          <MasonryGrid
            pins={pins}
            onPinClick={setSelectedPin}
            onLoadMore={() => {}}
            hasMore={false}
            loading={false}
          />
        )}
      </main>

      {selectedPin && (
        <PinModal pin={selectedPin} onClose={() => setSelectedPin(null)} />
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAF7F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          border: '2px solid #E8E2D9',
          borderTopColor: '#E63946',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
