// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import FeedPage from './pages/FeedPage';
import CreatePinPage from './pages/CreatePinPage';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';
import PrivateRoute from './components/auth/PrivateRoute';
import PageTransition from './components/ui/PageTransition';

function T({ children }) {
  return <PageTransition>{children}</PageTransition>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/auth'
          element={
            <T>
              <AuthPage />
            </T>
          }
        />
        <Route path='/auth/callback' element={<AuthCallback />} />
        <Route
          path='/'
          element={
            <PrivateRoute>
              <FeedPage />
            </PrivateRoute>
          }
        />
        <Route
          path='/explore'
          element={
            <PrivateRoute>
              <ExplorePage />
            </PrivateRoute>
          }
        />
        <Route
          path='/create'
          element={
            <PrivateRoute>
              <T>
                <CreatePinPage />
              </T>
            </PrivateRoute>
          }
        />
        <Route
          path='/profile/:username'
          element={
            <PrivateRoute>
              <T>
                <ProfilePage />
              </T>
            </PrivateRoute>
          }
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}
