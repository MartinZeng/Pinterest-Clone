// src/components/ui/PageTransition.jsx
// Wraps any page with a smooth fade+slide-up entrance animation.
// Usage: wrap your page root element, or use in App.jsx per route.

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './PageTransition.module.css';

export default function PageTransition({ children }) {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance on every route change
    setVisible(false);
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(t);
  }, [location.key]);

  return (
    <div className={`${styles.page} ${visible ? styles.visible : ''}`}>
      {children}
    </div>
  );
}
