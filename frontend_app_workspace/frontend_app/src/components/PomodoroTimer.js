import React, { useState, useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
/**
 * PomodoroTimer: 25min focus and 5min break timer cycles, start/pause/reset.
 * Props:
 *   - onSessionComplete(session): Called with {focus, break, timestamp} after complete a cycle.
 *   - sessionActiveUser: Currently active user for logging (if needed).
 */
export default function PomodoroTimer({ onSessionComplete, sessionActiveUser }) {
  const FOCUS_MIN = 25, BREAK_MIN = 5;
  const [mode, setMode] = useState('focus'); // focus or break
  const [seconds, setSeconds] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);
  const intervalRef = useRef(null);

  // PUBLIC_INTERFACE
  const start = () => setRunning(true);
  // PUBLIC_INTERFACE
  const pause = () => setRunning(false);
  // PUBLIC_INTERFACE
  const reset = () => {
    setRunning(false);
    setMode('focus');
    setSeconds(FOCUS_MIN * 60);
    setCycleCount(0);
  };

  useEffect(() => {
    if (running && seconds > 0) {
      intervalRef.current = setTimeout(() => setSeconds(s => s-1), 1000);
    } else if (running && seconds === 0) {
      // play beep, switch mode
      if (mode === 'focus') {
        setMode('break');
        setSeconds(BREAK_MIN * 60);
      } else {
        setMode('focus');
        setSeconds(FOCUS_MIN * 60);
        setCycleCount(c => {
          // Only log a session on completion of full focus+break
          if (onSessionComplete) onSessionComplete({ focus: FOCUS_MIN, break: BREAK_MIN, timestamp: new Date() });
          return c+1;
        });
      }
    }
    return () => clearTimeout(intervalRef.current);
  }, [running, seconds, mode, onSessionComplete]);

  // format mm:ss
  const min = String(Math.floor(seconds/60)).padStart(2, '0');
  const sec = String(seconds % 60).padStart(2, '0');

  return (
    <div className="timer-box">
      <div className="mode-label" style={{ color: mode === 'focus' ? '#66abf4' : '#f89472' }}>
        {mode === 'focus' ? 'Focus' : 'Break'}
      </div>
      <div className="timer-display">{min}:{sec}</div>
      <div className="timer-controls">
        {!running && <button className="btn primary" onClick={start}>Start</button>}
        {running && <button className="btn secondary" onClick={pause}>Pause</button>}
        <button className="btn accent" onClick={reset}>Reset</button>
      </div>
      <div className="cycle-info">Completed cycles: {cycleCount}</div>
    </div>
  );
}
