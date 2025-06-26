import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import './FocusTimer.css';
import PomodoroTimer from './components/PomodoroTimer';
import AuthModal from './components/AuthModal';
import SessionLogs from './components/SessionLogs';
import { supabase } from './supabaseClient';

// PUBLIC_INTERFACE
/**
 * App: Main orchestrator for FocusTimer Pomodoro App
 * - Timer UI (centered)
 * - Modal for Auth
 * - Session logs below timer
 * - Responsive and minimal UI
 * - Handles auth with Supabase and session log writes/reads.
 */
export default function App() {
  const [theme, setTheme] = useState('light');
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logsRefresh, setLogsRefresh] = useState(false);

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Auth Listener & Fetch User on mount
  useEffect(() => {
    let ignore = false;
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!ignore) setUser(user || null);
    }
    getUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, session) => {
      setUser(session?.user || null);
      setAuthOpen(false);
    });
    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  // PUBLIC_INTERFACE
  const openAuth = () => setAuthOpen(true);
  // PUBLIC_INTERFACE
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  // PUBLIC_INTERFACE
  const handleSessionComplete = useCallback(async session => {
    if (!user) return;
    await supabase.from('sessions').insert([{
      user_id: user.id,
      focus: session.focus,
      break: session.break,
      timestamp: new Date().toISOString(),
    }]);
    setLogsRefresh(x => !x);
  }, [user]);

  return (
    <div className="App timer-app-root">
      <header className="app-header">
        <span className="brand-title">FocusTimer</span>
        <div className="header-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
          {user ? (
            <div className="user-section">
              <span className="user-email">{user.email}</span>
              <button className="btn small accent" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <button className="btn primary" onClick={openAuth} aria-label="Login or Sign Up">Login</button>
          )}
        </div>
      </header>
      <main>
        <div className="timer-center">
          <PomodoroTimer onSessionComplete={handleSessionComplete} sessionActiveUser={user} />
        </div>
        <SessionLogs user={user} refresh={logsRefresh}/>
      </main>
      <AuthModal open={authOpen} onAuth={setUser} onClose={() => setAuthOpen(false)} />
      <footer className="app-footer">
        <span>
          <a href="https://supabase.com" className="footer-link" target="_blank" rel="noopener noreferrer">Supabase</a> Auth &nbsp;|&nbsp; 
          <a href="https://react.dev" className="footer-link" target="_blank" rel="noopener noreferrer">React</a>
        </span>
      </footer>
    </div>
  );
}
