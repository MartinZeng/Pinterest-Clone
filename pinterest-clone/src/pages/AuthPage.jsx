// src/pages/AuthPage.jsx
// Full-screen auth page: login + signup tabs, OAuth + email/password
// Aesthetic: warm cream + deep terracotta — editorial, magazine-inspired

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGitHub,
  } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGitHub() {
    setError(null);
    try {
      await signInWithGitHub();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.root}>
      {/* Left panel — decorative mosaic */}
      <div className={styles.mosaicPanel} aria-hidden='true'>
        <div className={styles.mosaicGrid}>
          {MOSAIC_COLORS.map((color, i) => (
            <div
              key={i}
              className={styles.mosaicTile}
              style={{ background: color, animationDelay: `${i * 0.04}s` }}
            />
          ))}
        </div>
        <div className={styles.mosaicOverlay}>
          <PinLogo />
          <p className={styles.tagline}>Your world, curated.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.formPanel}>
        <div className={styles.formCard}>
          {/* Logo (mobile only) */}
          <div className={styles.mobileLogo}>
            <PinLogo />
          </div>

          {/* Tab switcher */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              Sign in
            </button>
            <button
              className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
            >
              Create account
            </button>
          </div>

          <h1 className={styles.heading}>
            {mode === 'login' ? 'Welcome back' : 'Join Pinboard'}
          </h1>
          <p className={styles.subheading}>
            {mode === 'login'
              ? 'Sign in to see your saved ideas'
              : 'Save ideas that inspire you'}
          </p>

          {/* OAuth buttons */}
          <div className={styles.oauthGroup}>
            <button
              className={styles.oauthBtn}
              onClick={handleGoogle}
              type='button'
            >
              <GoogleIcon />
              Continue with Google
            </button>
            <button
              className={styles.oauthBtn}
              onClick={handleGitHub}
              type='button'
            >
              <GitHubIcon />
              Continue with GitHub
            </button>
          </div>

          <div className={styles.divider}>
            <span>or</span>
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor='email'>
                Email
              </label>
              <input
                id='email'
                className={styles.input}
                type='email'
                placeholder='you@example.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='email'
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor='password'>
                Password
              </label>
              <input
                id='password'
                className={styles.input}
                type='password'
                placeholder={
                  mode === 'signup' ? 'At least 8 characters' : '••••••••'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete={
                  mode === 'login' ? 'current-password' : 'new-password'
                }
              />
            </div>

            {error && <div className={styles.errorBanner}>{error}</div>}

            <button
              className={styles.submitBtn}
              type='submit'
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner} />
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className={styles.footerNote}>
              Don't have an account?{' '}
              <button
                className={styles.switchLink}
                onClick={() => setMode('signup')}
              >
                Sign up free
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Decorative mosaic palette ─────────────────────────────────
const MOSAIC_COLORS = [
  '#E63946',
  '#F4A261',
  '#E9C46A',
  '#2A9D8F',
  '#264653',
  '#F7C59F',
  '#E76F51',
  '#A8DADC',
  '#457B9D',
  '#1D3557',
  '#FFDDD2',
  '#E8C4B8',
  '#C9B99A',
  '#8B7355',
  '#5C4033',
  '#FFB7C5',
  '#FF8FAB',
  '#FB6F92',
  '#C77DFF',
  '#9D4EDD',
  '#D4E09B',
  '#A7C957',
  '#6A994E',
  '#386641',
  '#BC4749',
  '#FEC89A',
  '#FEC5BB',
  '#FFD7BA',
  '#E8E8E4',
  '#B5B9BF',
  '#FFCDB2',
  '#FFB4A2',
  '#E5989B',
  '#B5838D',
  '#6D6875',
  '#CAF0F8',
  '#90E0EF',
  '#00B4D8',
  '#0077B6',
  '#03045E',
];

// ── SVG icons ─────────────────────────────────────────────────
function PinLogo() {
  return (
    <svg
      width='36'
      height='36'
      viewBox='0 0 36 36'
      fill='none'
      aria-label='Pinboard'
    >
      <circle cx='18' cy='18' r='18' fill='#E63946' />
      <path
        d='M18 8C14.13 8 11 11.13 11 15c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
        fill='white'
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width='18' height='18' viewBox='0 0 18 18' aria-hidden='true'>
      <path
        d='M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z'
        fill='#4285F4'
      />
      <path
        d='M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z'
        fill='#34A853'
      />
      <path
        d='M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z'
        fill='#FBBC05'
      />
      <path
        d='M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z'
        fill='#EA4335'
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
    >
      <path d='M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z' />
    </svg>
  );
}
