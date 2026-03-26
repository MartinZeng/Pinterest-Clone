// src/pages/CreatePinPage.jsx
// Drag-and-drop pin upload with title, description, tags, source URL.

import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase, uploadPinImage } from '../lib/supabase';
import Navbar from '../components/layout/Navbar';
import styles from './CreatePinPage.module.css';

export default function CreatePinPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // ── File handling ────────────────────────────────────────────
  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Image must be under 10 MB.');
      return;
    }
    setFile(f);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);

  // ── Tag handling ─────────────────────────────────────────────
  function addTag(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '');
      if (t && !tags.includes(t) && tags.length < 10) {
        setTags((prev) => [...prev, t]);
      }
      setTagInput('');
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('Please choose an image.');
      return;
    }
    if (!user) {
      setError('You must be signed in.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. Upload image to Supabase Storage
      const imageUrl = await uploadPinImage(file, user.id);

      // 2. Get image dimensions from the preview
      const dims = await getImageDimensions(preview);

      // 3. Insert pin row
      const { error: insertError } = await supabase
        .from('pins')
        .insert({
          user_id: user.id,
          title: title.trim() || null,
          description: description.trim() || null,
          image_url: imageUrl,
          thumb_url: imageUrl, // edge fn will replace with optimised thumb
          source_url: sourceUrl.trim() || null,
          tags,
          width: dims.width,
          height: dims.height,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.root}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.heading}>Create pin</h1>

          <div className={styles.layout}>
            {/* Left — drop zone */}
            <div
              className={`${styles.dropZone} ${dragging ? styles.dropZoneDragging : ''} ${preview ? styles.dropZoneHasImage : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => !preview && inputRef.current?.click()}
            >
              {preview ? (
                <>
                  <img src={preview} alt='Preview' className={styles.preview} />
                  <button
                    className={styles.replaceBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    Replace
                  </button>
                </>
              ) : (
                <div className={styles.dropPrompt}>
                  <div className={styles.dropIcon}>
                    <svg
                      width='32'
                      height='32'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4' />
                      <polyline points='17 8 12 3 7 8' />
                      <line x1='12' y1='3' x2='12' y2='15' />
                    </svg>
                  </div>
                  <p className={styles.dropTitle}>
                    Drag and drop or click to upload
                  </p>
                  <p className={styles.dropSub}>
                    JPG, PNG, WebP, GIF — max 10 MB
                  </p>
                </div>
              )}
              <input
                ref={inputRef}
                type='file'
                accept='image/*'
                className={styles.fileInput}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            {/* Right — form */}
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>Title</label>
                <input
                  className={styles.input}
                  type='text'
                  placeholder='Add a title'
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder='Tell everyone what your pin is about'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Source link</label>
                <input
                  className={styles.input}
                  type='url'
                  placeholder='https://example.com'
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Tags{' '}
                  <span className={styles.labelHint}>press Enter to add</span>
                </label>
                <div className={`${styles.tagField} ${styles.input}`}>
                  {tags.map((tag) => (
                    <span key={tag} className={styles.tagPill}>
                      {tag}
                      <button
                        type='button'
                        className={styles.tagRemove}
                        onClick={() => removeTag(tag)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    className={styles.tagInput}
                    type='text'
                    placeholder={tags.length ? '' : 'nature, travel, food…'}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
              </div>

              {error && <div className={styles.error}>{error}</div>}

              <div className={styles.formActions}>
                <button
                  type='button'
                  className={styles.cancelBtn}
                  onClick={() => navigate('/')}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className={styles.publishBtn}
                  disabled={saving || !file}
                >
                  {saving ? <span className={styles.spinner} /> : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function getImageDimensions(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: null, height: null });
    img.src = src;
  });
}
