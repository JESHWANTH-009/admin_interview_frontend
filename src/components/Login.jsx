import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import './Login.css';

function Login({ onLoginSuccess, onToggleView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // ✅ Full console log (no truncation)
      console.log('✅ Email Login Successful');
      console.log('UID:', user.uid);
      console.log('Email:', user.email);
      console.log(`Token:\n${idToken}`);

      // Optional: copy to clipboard for debugging
      // navigator.clipboard.writeText(idToken);

      localStorage.setItem('firebase_id_token', idToken);
      if (onLoginSuccess) onLoginSuccess(user.uid, user.email, idToken);

      // Delay for console debug visibility
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 1000);
    } catch (err) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      console.log('Google Login Successful');
      console.log('UID:', user.uid);
      console.log('Email:', user.email);
      console.log(`Token:\n${idToken}`);

      localStorage.setItem('firebase_id_token', idToken);
      if (onLoginSuccess) onLoginSuccess(user.uid, user.email, idToken);

      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 1000);
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue your interview preparation</p>
        </div>

        <button className="google-signin-btn" onClick={handleGoogleLogin} disabled={loading}>
          <span className="google-icon">
            {/* Google G Logo */}
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M21.805 11.227c0-.781-.07-1.563-.217-2.32H11.22v4.395h5.98a5.13 5.13 0 0 1-2.227 3.37v2.797h3.602c2.11-1.945 3.23-4.813 3.23-8.242z" fill="#4285F4"/>
                <path d="M11.22 22c2.917 0 5.372-.969 7.163-2.633l-3.602-2.797c-1.008.68-2.297 1.086-3.561 1.086-2.74 0-5.063-1.852-5.898-4.344H1.62v2.844A10.98 10.98 0 0 0 11.22 22z" fill="#34A853"/>
                <path d="M5.322 13.312A6.573 6.573 0 0 1 4.97 11c0-.805.145-1.586.352-2.312V5.844H1.62A10.98 10.98 0 0 0 .22 11c0 1.797.43 3.5 1.4 5.156l3.702-2.844z" fill="#FBBC05"/>
                <path d="M11.22 4.344c1.594 0 3.016.547 4.14 1.617l3.11-3.11C16.59 1.016 14.137 0 11.22 0A10.98 10.98 0 0 0 1.62 5.844l3.702 2.844c.836-2.492 3.16-4.344 5.898-4.344z" fill="#EA4335"/>
              </g>
            </svg>
          </span>
          <span className="google-btn-text">Continue with Google</span>
        </button>

        <div className="divider"><span>OR CONTINUE WITH</span></div>

        <form className="auth-form" onSubmit={handleEmailLogin}>
          {error && <div className="auth-error">{error}</div>}
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="auth-input"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="auth-input"
            />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <span>Don&apos;t have an account? </span>
          <button className="auth-link" onClick={onToggleView}>Sign up</button>
        </div>
      </div>
    </div>
  );
}

export default Login;
