import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

// PUBLIC_INTERFACE
/**
 * AuthModal: Modal for user sign in and sign up.
 * Props:
 *   - open: Boolean, controls modal visibility
 *   - onClose: Function, called when modal or overlay is closed
 *   - onAuth: Function(user), called after successful authentication
 */
export default function AuthModal({ open, onClose, onAuth }) {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const resetFields = () => {
    setEmail('');
    setPassword('');
    setErr('');
  };

  // PUBLIC_INTERFACE
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    const { error, user, data } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else {
      resetFields();
      onAuth(data?.user);
      onClose();
    }
  };

  // PUBLIC_INTERFACE
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    const { error, user, data } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setErr(error.message);
    else {
      resetFields();
      onAuth(data?.user);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose} tabIndex={-1}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{view === 'login' ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={view === 'login' ? handleLogin : handleSignup}>
          <label>
            Email:
            <input type="email" value={email} required onChange={e => setEmail(e.target.value)} autoFocus />
          </label>
          <label>
            Password:
            <input type="password" value={password} required onChange={e => setPassword(e.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? (view === 'login' ? 'Logging in...' : 'Signing up...') : (view === 'login' ? 'Login' : 'Sign Up')}
          </button>
        </form>
        {err && <div className="modal-error">{err}</div>}
        <div style={{ marginTop: 10 }}>
          {view === 'login'
            ? <span>Need an account? <button className="link-btn" onClick={() => { setView('signup'); setErr(''); }}>Sign Up</button></span>
            : <span>Have an account? <button className="link-btn" onClick={() => { setView('login'); setErr(''); }}>Login</button></span>
          }
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close modal">&times;</button>
      </div>
    </div>
  );
}
