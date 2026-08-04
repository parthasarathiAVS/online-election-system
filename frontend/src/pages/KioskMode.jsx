import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Avatar } from '@mui/material';

const KioskMode = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const electionId = window.location.pathname.split('/').pop();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({ total: 0 });

  // Kiosk state
  const [evmLocked, setEvmLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastHash, setLastHash] = useState('');
  const [lastVotedName, setLastVotedName] = useState('');
  const [lastVotedCandidate, setLastVotedCandidate] = useState(null);
  const [votedIdx, setVotedIdx] = useState(-1);    // which candidate is blinking
  const [activeNumpadKey, setActiveNumpadKey] = useState(null);

  // Student Verification state
  const [verificationInput, setVerificationInput] = useState('');
  const [pendingStudent, setPendingStudent] = useState(null);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Refs to avoid stale closures
  const evmLockedRef = useRef(false);
  const showReceiptRef = useRef(false);
  const candidatesRef = useRef([]);
  const verifiedStudentRef = useRef(null);
  const countdownTimer = useRef(null);
  const numpadKeyTimer = useRef(null);

  // Keep refs in sync
  useEffect(() => { evmLockedRef.current = evmLocked; }, [evmLocked]);
  useEffect(() => { showReceiptRef.current = showReceipt; }, [showReceipt]);
  useEffect(() => { candidatesRef.current = candidates; }, [candidates]);
  useEffect(() => { verifiedStudentRef.current = verifiedStudent; }, [verifiedStudent]);

  // ── Fetch data & setup ──────────────────────
  useEffect(() => {
    fetchData();
    requestFullscreen();
    
    // Prevent losing focus
    const handleBlur = () => window.focus();
    window.addEventListener('blur', handleBlur);

    return () => { 
      window.removeEventListener('blur', handleBlur);
      if (countdownTimer.current) clearInterval(countdownTimer.current); 
    };
  }, []);

  // ── Single stable keyboard listener ─────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Officer exit combo
      if (e.ctrlKey && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        confirmOfficerExit();
        return;
      }
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }
      e.preventDefault(); // Block all keys in kiosk

      if (!verifiedStudentRef.current || evmLockedRef.current || showReceiptRef.current || candidatesRef.current.length === 0) return;

      const code = e.code;
      const numMap = { 
        'Numpad1':1, 'Numpad2':2, 'Numpad3':3, 'Numpad4':4, 'Numpad5':5, 'Numpad6':6, 'Numpad7':7, 'Numpad8':8, 'Numpad9':9,
        'Digit1':1, 'Digit2':2, 'Digit3':3, 'Digit4':4, 'Digit5':5, 'Digit6':6, 'Digit7':7, 'Digit8':8, 'Digit9':9
      };

      if (numMap[code]) {
        const n = numMap[code];
        if (n >= 1 && n <= candidatesRef.current.length) {
          highlightNumpadKey(n);
          playSelectBeep();
          setTimeout(() => castVote(n - 1), 300);
        }
      }
    };

    const blockContextMenu = (e) => e.preventDefault();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', blockContextMenu);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', blockContextMenu);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [resDash, resCand] = await Promise.all([
        api.get(`/admin/dashboard?electionId=${electionId}`),
        api.get(`/admin/candidates?electionId=${electionId}`)
      ]);
      setElection({ Title: resDash.data.title, Status: resDash.data.electionStatus });
      setStats({ total: resDash.data.votesCast });
      setCandidates(resCand.data);
    } catch (err) {
      console.error('Error fetching kiosk data', err);
    }
  };

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      // Lock system keys (Alt+Tab, Win Key, etc) in supported browsers (Chrome/Edge)
      if (navigator.keyboard && navigator.keyboard.lock) {
        await navigator.keyboard.lock();
      }
    } catch (e) {
      console.warn("Fullscreen or Keyboard Lock failed", e);
    }
  };

  const confirmOfficerExit = () => {
    const pass = window.prompt('Enter Officer Password to exit AVS Voting System:');
    if (pass === 'Avscollege@6235') {
      if (navigator.keyboard && navigator.keyboard.unlock) {
        navigator.keyboard.unlock();
      }
      document.exitFullscreen?.().catch(() => {});
      navigate('/admin');
    } else if (pass !== null) {
      alert('Incorrect password!');
    }
  };

  const highlightNumpadKey = (n) => {
    setActiveNumpadKey(n);
    clearTimeout(numpadKeyTimer.current);
    numpadKeyTimer.current = setTimeout(() => setActiveNumpadKey(null), 500);
  };

  const playSelectBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  const playVoteBeat = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const playTone = (type, freq, start, dur, vol, endFreq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + start + dur);
        gain.gain.setValueAtTime(vol, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur + 0.05);
      };
      playTone('sine', 80, 0, 0.18, 0.9, 40);
      playTone('square', 600, 0.05, 0.12, 0.3);
      playTone('sine', 880, 0.22, 0.35, 0.6, 1100);
      playTone('sine', 1320, 0.40, 0.25, 0.5);
      playTone('sine', 1100, 0.55, 0.45, 0.4, 1320);
    } catch (e) {}
  };

  const playSuccessBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.25);
    } catch (e) {}
  };

  const playErrorBeep = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const resetEVM = () => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
    evmLockedRef.current = false;
    showReceiptRef.current = false;
    setEvmLocked(false);
    setShowReceipt(false);
    setVotedIdx(-1);
    setVerifiedStudent(null);
    setPendingStudent(null);
    setVerificationInput('');
    setVerificationError('');
  };

  const handleVerifyStudent = async (e) => {
    e.preventDefault();
    if (!verificationInput.trim()) return;

    setIsVerifying(true);
    setVerificationError('');
    try {
      const res = await api.post('/admin/kiosk/verify-student', {
        electionId,
        registrationNumber: verificationInput.trim()
      });
      setPendingStudent(res.data.student);
      playSuccessBeep();
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      setVerificationError(msg);
      playErrorBeep();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleEnableBallot = () => {
    if (!pendingStudent) return;
    setVerifiedStudent(pendingStudent);
    playSuccessBeep();
  };

  // ── Cast Vote ───────────────────────────────
  const castVote = async (idx) => {
    if (evmLockedRef.current) return;
    const cands = candidatesRef.current;
    if (idx < 0 || idx >= cands.length) return;
    if (!verifiedStudentRef.current) return;

    const c = cands[idx];
    evmLockedRef.current = true;
    setEvmLocked(true);
    setLastVotedName(c.FullName);
    setLastVotedCandidate(c);
    setVotedIdx(idx);

    try {
      const res = await api.post('/admin/kiosk/vote', { 
        electionId, 
        candidateId: c.CandidateID,
        studentId: verifiedStudentRef.current.id
      });
      setLastHash(res.data.receipt);
      setStats(s => ({ total: s.total + 1 }));
      playVoteBeat();

      // Show receipt after 2s blink
      setTimeout(() => {
        setVotedIdx(-1);
        showReceiptRef.current = true;
        setShowReceipt(true);
      }, 2000);

      // Start 20-second countdown
      setLockTimer(20);
      if (countdownTimer.current) clearInterval(countdownTimer.current);
      countdownTimer.current = setInterval(() => {
        setLockTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer.current);
            countdownTimer.current = null;
            resetEVM();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      alert(err.response?.data?.message || 'Error casting vote');
      evmLockedRef.current = false;
      setEvmLocked(false);
      setVotedIdx(-1);
    }
  };

  if (!election) return <Box p={4} color="white">Loading EVM...</Box>;

  // Student verification block
  if (!verifiedStudent) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg,#020915 0%,#050f1f 50%,#030c18 100%)', minHeight: '100vh', userSelect: 'none' }}>
        {/* Accent Bar */}
        <Box sx={{ height: 6, background: 'linear-gradient(90deg, #0F766E 0%, #06B6D4 50%, #4338CA 100%)' }} />

        {/* Header */}
        <Box sx={{ p: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0F172A', borderBottom: '4px solid #0F766E' }}>
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 1, color: '#FFFFFF' }}>🗳️ AVS CAMPUS ELECTRONIC VOTING SYSTEM</Typography>
            <Typography variant="body2" sx={{ letterSpacing: 2, color: '#94A3B8', textTransform: 'uppercase' }}>
              College Campus Election System — {election.Title}
            </Typography>
          </Box>
          <Box textAlign="right" sx={{ minWidth: 140 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2 }}>Votes Cast</Typography>
            <Typography variant="h3" color="#06B6D4" fontWeight={900}>{stats.total}</Typography>
          </Box>
        </Box>

        {/* Center Panel */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, position: 'relative', overflow: 'hidden' }}>
          {/* Decorative background glows */}
          <Box sx={{ position: 'absolute', top: '10%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(15,118,110,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: '10%', right: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

          {!pendingStudent ? (
            /* Phase 1: Enter Registration Number */
            <Box component="form" onSubmit={handleVerifyStudent} sx={{ maxWidth: 500, width: '100%', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', p: 4, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', mb: 3 }}>
                <Typography sx={{ color: '#ef4444', fontSize: '2rem', lineHeight: 1 }}>🔒</Typography>
              </Box>

              <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', mb: 1 }}>EVM Control Unit Locked</Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 4 }}>Election Officer supervision required. Please verify the student's Register Number to unlock the ballot unit.</Typography>

              {verificationError && (
                <Box sx={{ p: 2, mb: 3, borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: '#f87171', fontWeight: 600 }}>⚠️ {verificationError}</Typography>
                </Box>
              )}

              <Typography variant="caption" sx={{ color: '#06B6D4', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', mb: 1, display: 'block', textAlign: 'left' }}>
                Student Register Number
              </Typography>
              <input
                type="text"
                value={verificationInput}
                onChange={e => setVerificationInput(e.target.value)}
                placeholder="Enter Register Number"
                disabled={isVerifying}
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  color: '#FFFFFF',
                  background: 'rgba(255,255,255,0.03)',
                  border: '2px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  outline: 'none',
                  textAlign: 'center',
                  marginBottom: '24px',
                  transition: 'all 0.2s',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
              />

              <Button
                type="submit"
                disabled={isVerifying || !verificationInput.trim()}
                variant="contained"
                sx={{
                  width: '100%', py: 1.8, fontSize: '1rem', fontWeight: 800, borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0F766E, #06B6D4)',
                  boxShadow: '0 8px 24px rgba(6,182,212,0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #115E59, #0891B2)' },
                  '&:disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }
                }}
              >
                {isVerifying ? 'VERIFYING...' : 'VERIFY STUDENT'}
              </Button>
            </Box>
          ) : (
            /* Phase 2: Show Verified Student Details & Unlock Button */
            <Box sx={{ maxWidth: 520, width: '100%', background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', p: 4, textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', position: 'relative', zIndex: 1 }}>
              <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', mb: 3 }}>
                <Typography sx={{ color: '#10b981', fontSize: '2rem', lineHeight: 1 }}>🟢</Typography>
              </Box>

              <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF', mb: 1 }}>Student Verified</Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Please confirm student details before unlocking the EVM ballot unit.</Typography>

              {/* Student Details Card */}
              <Box sx={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                p: 3,
                mb: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                textAlign: 'left'
              }}>
                <Avatar
                  src={pendingStudent.profilePhoto || ''}
                  sx={{
                    width: 80, height: 80, fontSize: '2.5rem',
                    border: '3px solid #06B6D4',
                    background: 'rgba(6,182,212,0.1)'
                  }}
                >
                  {!pendingStudent.profilePhoto && pendingStudent.fullName[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ color: '#FFFFFF' }}>{pendingStudent.fullName}</Typography>
                  <Typography variant="body2" sx={{ color: '#06B6D4', fontWeight: 600, mt: 0.5 }}>Reg No: {pendingStudent.registrationNumber}</Typography>
                  <Typography variant="body2" sx={{ color: '#94A3B8', mt: 0.5 }}>Dept: {pendingStudent.department || 'N/A'}</Typography>
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                <Button
                  onClick={() => { setPendingStudent(null); setVerificationInput(''); }}
                  variant="outlined"
                  sx={{ flex: 1, py: 1.5, borderRadius: '12px', borderColor: 'rgba(255,255,255,0.15)', color: '#94A3B8', '&:hover': { borderColor: '#ef4444', color: '#ef4444' } }}
                >
                  CANCEL
                </Button>
                <Button
                  onClick={handleEnableBallot}
                  variant="contained"
                  sx={{
                    flex: 2, py: 1.5, borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)' }
                  }}
                >
                  ENABLE BALLOT UNIT
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{ p: '14px 32px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,37,64,.7)', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 3, fontSize: '.78rem', color: 'text.secondary' }}>
            <Box>🔑 Press <span style={{ color: '#FF9933', fontWeight: 800 }}>Ctrl+Shift+Esc</span> to exit Kiosk Mode</Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Box sx={{ px: 2, py: 0.5, borderRadius: 2, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '.72rem', color: '#ef4444', fontWeight: 700 }}>
              TERMINAL LOCKED — ACTION REQUIRED
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  const len = candidates.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg,#020915 0%,#050f1f 50%,#030c18 100%)', minHeight: '100vh', userSelect: 'none', cursor: 'none', '& *': { cursor: 'none !important' } }}>

      {/* ── Receipt Overlay ── */}
      {showReceipt && lastVotedCandidate && (
        <Box sx={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,9,21,.97)' }}>
          {/* Background glow orbs */}
          <Box sx={{ position: 'absolute', top: '20%', left: '15%', width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle, ${lastVotedCandidate.Color || '#10B981'}20 0%, transparent 70%)`, pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: '15%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <Box className="slide-up" sx={{ maxWidth: 560, width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', overflow: 'hidden', position: 'relative', zIndex: 2 }}>
            {/* Top gradient bar */}
            <Box sx={{ height: 5, background: `linear-gradient(90deg, ${lastVotedCandidate.Color || '#0F766E'} 0%, #10B981 50%, #06B6D4 100%)` }} />

            <Box sx={{ p: { xs: 3.5, sm: 5 }, textAlign: 'center' }}>

              {/* ── Candidate Photo with animated ring + voted badge ── */}
              <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
                {/* Spinning glow ring */}
                <Box sx={{
                  position: 'absolute', inset: -8,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, #10B981, ${lastVotedCandidate.Color || '#06B6D4'})`,
                  animation: 'spin 4s linear infinite',
                  '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }
                }} />
                {/* Dark gap ring */}
                <Box sx={{ position: 'absolute', inset: -4, borderRadius: '50%', background: '#0A0F1E' }} />

                <Avatar
                  src={lastVotedCandidate.PhotoURL || ''}
                  sx={{
                    width: 130,
                    height: 130,
                    fontSize: '4rem',
                    border: `4px solid ${lastVotedCandidate.Color || '#10B981'}`,
                    background: lastVotedCandidate.PhotoURL ? 'transparent' : `${lastVotedCandidate.Color || '#10B981'}22`,
                    position: 'relative',
                    zIndex: 1,
                    boxShadow: `0 16px 40px ${lastVotedCandidate.Color || '#10B981'}55`
                  }}
                >
                  {!lastVotedCandidate.PhotoURL && lastVotedCandidate.Symbol}
                </Avatar>

                {/* ✓ Voted badge */}
                <Box sx={{
                  position: 'absolute', bottom: 4, right: 4,
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  border: '3px solid #0A0F1E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2,
                  boxShadow: '0 4px 16px rgba(16,185,129,0.6)'
                }}>
                  <Typography sx={{ color: '#FFF', fontSize: '1.3rem', fontWeight: 900 }}>✓</Typography>
                </Box>
              </Box>

              {/* VOTE CONFIRMED badge */}
              <Box sx={{
                display: 'inline-flex', alignItems: 'center', gap: 1,
                px: 3, py: 0.8, borderRadius: '20px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                mb: 2
              }}>
                <Typography sx={{ color: '#22c55e', fontSize: '1rem' }}>✓</Typography>
                <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Vote Recorded Successfully</Typography>
              </Box>

              <Typography variant="h4" fontWeight={800} sx={{ color: '#FFFFFF', mb: 0.5, letterSpacing: -0.5 }}>Vote Confirmed!</Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mb: 3 }}>Your ballot has been encrypted and securely recorded.</Typography>

              {/* ── Voted Candidate Card ── */}
              <Box sx={{
                background: `linear-gradient(135deg, ${lastVotedCandidate.Color || '#0F766E'}15, rgba(6,182,212,0.06))`,
                border: `2px solid ${lastVotedCandidate.Color || '#10B981'}44`,
                borderRadius: '16px',
                p: 2.5,
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                textAlign: 'left'
              }}>
                {/* Mini photo */}
                <Avatar
                  src={lastVotedCandidate.PhotoURL || ''}
                  sx={{
                    width: 60, height: 60, fontSize: '1.8rem',
                    border: `2px solid ${lastVotedCandidate.Color || '#10B981'}`,
                    background: `${lastVotedCandidate.Color || '#10B981'}22`,
                    flexShrink: 0
                  }}
                >
                  {!lastVotedCandidate.PhotoURL && lastVotedCandidate.Symbol}
                </Avatar>

                <Box flex={1} minWidth={0}>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }} display="block">You Voted For</Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#FFFFFF' }} noWrap>{lastVotedCandidate.FullName}</Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.3}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: lastVotedCandidate.Color || '#10B981', flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ color: lastVotedCandidate.Color || '#06B6D4', fontWeight: 600 }} noWrap>{lastVotedCandidate.Party}</Typography>
                  </Box>
                </Box>

                {/* Election Symbol */}
                <Box sx={{
                  width: 56, height: 56, borderRadius: '14px',
                  background: `${lastVotedCandidate.Color || '#10B981'}18`,
                  border: `1.5px solid ${lastVotedCandidate.Color || '#10B981'}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', flexShrink: 0
                }}>
                  {lastVotedCandidate.Symbol}
                </Box>
              </Box>

              {/* Crypto receipt */}
              <Box sx={{ background: 'rgba(255,255,255,0.04)', borderRadius: 2, p: 2, mb: 3, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: 1 }} display="block" mb={0.5}>
                  🔐 CRYPTOGRAPHIC BALLOT RECEIPT
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', color: '#06B6D4', fontWeight: 700, wordBreak: 'break-all', fontSize: '0.72rem' }}>
                  {lastHash}
                </Typography>
              </Box>

              {/* Next voter countdown */}
              <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', p: 3, borderRadius: '16px', background: 'rgba(15,118,110,0.08)', border: '1px solid rgba(15,118,110,0.2)' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', mb: 1, textTransform: 'uppercase', letterSpacing: 2 }}>Next Voter In</Typography>
                <Typography variant="h1" sx={{ color: '#06B6D4', fontWeight: 900, fontSize: '4rem', lineHeight: 1 }}>{lockTimer}</Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8', mt: 1 }}>seconds</Typography>
              </Box>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={resetEVM}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#06B6D4',
                      color: '#06B6D4',
                      background: 'rgba(6,182,212,0.05)',
                    }
                  }}
                >
                  Skip & Lock Terminal
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── Top Header ── */}
      <Box sx={{ background: '#0F172A', borderBottom: '4px solid #0F766E' }}>
        {/* Accent Bar */}
        <Box sx={{ height: 6, background: 'linear-gradient(90deg, #0F766E 0%, #06B6D4 50%, #4338CA 100%)' }} />
        <Box sx={{ p: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ letterSpacing: 1, color: '#FFFFFF' }}>🗳️ AVS CAMPUS ELECTRONIC VOTING SYSTEM</Typography>
            <Typography variant="body2" sx={{ letterSpacing: 2, color: '#94A3B8', textTransform: 'uppercase' }}>
              College Campus Election System — {election.Title}
            </Typography>
            {verifiedStudent && (
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mt: 1, px: 2, py: 0.5, borderRadius: '12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <Typography sx={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                  🟢 BALLOT ENABLED — STUDENT: {verifiedStudent.fullName} ({verifiedStudent.registrationNumber})
                </Typography>
              </Box>
            )}
          </Box>
          <Box textAlign="right" sx={{ minWidth: 140 }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 2 }}>Votes Cast</Typography>
            <Typography variant="h3" color="#06B6D4" fontWeight={900}>{stats.total}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Candidate Ballot List ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: { xs: 2, md: 4 }, maxWidth: candidates.length > 5 ? 1400 : 1100, width: '100%', mx: 'auto' }}>

        {(() => {
          const useTwoCols = candidates.length > 5;
          const col1 = useTwoCols ? candidates.slice(0, Math.ceil(candidates.length / 2)) : candidates;
          const col2 = useTwoCols ? candidates.slice(Math.ceil(candidates.length / 2)) : [];
          const col1Offset = 0;
          const col2Offset = Math.ceil(candidates.length / 2);

          const renderColumn = (data, offset) => (
            <Box sx={{ flex: 1 }}>
              {/* Table Header */}
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '45px 50px 1.2fr 1fr 1fr 60px 40px 90px',
                  md: '60px 70px 1.5fr 1.2fr 1.2fr 80px 50px 120px'
                },
                alignItems: 'center',
                p: useTwoCols ? '10px 14px' : '12px 20px', mb: 1, borderRadius: '12px 12px 0 0',
                background: 'linear-gradient(135deg, #0F766E, #06B6D4)',
                color: '#fff', fontWeight: 800, fontSize: '.75rem', letterSpacing: 1.5, textTransform: 'uppercase'
              }}>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem' }}>No.</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem' }}>Photo</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem' }}>Candidate</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem' }}>Department</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem' }}>Position</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem', textAlign: 'center' }}>Symbol</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem', textAlign: 'center' }}>LED</Typography>
                <Typography sx={{ fontWeight: 800, fontSize: '.7rem', textAlign: 'center' }}>Vote</Typography>
              </Box>

              {/* Candidate Rows */}
              {data.map((cand, i) => {
                const globalIdx = offset + i;
                const isVoted = votedIdx === globalIdx;
                const isActive = activeNumpadKey === globalIdx + 1;

                return (
                  <Box key={cand.CandidateID} sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '45px 50px 1.2fr 1fr 1fr 60px 40px 90px',
                      md: '60px 70px 1.5fr 1.2fr 1.2fr 80px 50px 120px'
                    },
                    alignItems: 'center', p: useTwoCols ? '10px 14px' : '14px 20px',
                    background: isVoted
                      ? 'rgba(255,153,51,0.2)'
                      : isActive
                        ? 'rgba(255,153,51,0.08)'
                        : globalIdx % 2 === 0
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(255,255,255,0.01)',
                    borderLeft: `4px solid ${isVoted ? '#FF9933' : cand.Color || '#3b82f6'}`,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    animation: isVoted ? 'megaBlink 0.35s ease-in-out infinite' : 'none',
                    transition: 'all 0.2s ease',
                    transform: isActive ? 'scale(1.01)' : 'scale(1)',
                  }}>
                    {/* Number */}
                    <Box sx={{
                      width: useTwoCols ? 32 : 42, height: useTwoCols ? 32 : 42, borderRadius: '10px',
                      background: isVoted ? '#FF9933' : 'rgba(255,255,255,0.06)',
                      border: `2px solid ${isVoted ? '#FF9933' : 'rgba(255,255,255,0.15)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: useTwoCols ? '0.9rem' : '1.2rem',
                      color: isVoted ? '#fff' : '#FF9933'
                    }}>
                      {globalIdx + 1}
                    </Box>

                    {/* Photo */}
                    <Box sx={{
                      width: useTwoCols ? 40 : 54, height: useTwoCols ? 40 : 54, borderRadius: '50%',
                      overflow: 'hidden', border: `2px solid ${cand.Color || '#3b82f6'}55`,
                      background: `${cand.Color || '#3b82f6'}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {cand.PhotoURL ? (
                        <img src={cand.PhotoURL} alt={cand.FullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Avatar sx={{ width: '100%', height: '100%', background: cand.Color || '#3b82f6', fontSize: useTwoCols ? '1rem' : '1.3rem', fontWeight: 800 }}>
                          {cand.FullName[0]}
                        </Avatar>
                      )}
                    </Box>

                    {/* Name */}
                    <Box sx={{ pr: 1 }}>
                      <Typography fontWeight={800} fontSize={useTwoCols ? '.9rem' : '1.1rem'} sx={{ lineHeight: 1.2 }}>{cand.FullName}</Typography>
                      {cand.Manifesto && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', opacity: 0.7, display: { xs: 'none', sm: 'block' } }}>
                          {cand.Manifesto.length > 30 ? cand.Manifesto.slice(0, 30) + '...' : cand.Manifesto}
                        </Typography>
                      )}
                    </Box>

                    {/* Department */}
                    <Box>
                      <Typography fontWeight={600} color="#94A3B8" fontSize={useTwoCols ? '.8rem' : '.9rem'}>
                        {cand.Department?.Name || (cand.Party && cand.Party.includes('/') ? cand.Party.split('/')[1].trim() : cand.Party || 'General')}
                      </Typography>
                    </Box>

                    {/* Position */}
                    <Box>
                      <Typography fontWeight={600} color="#94A3B8" fontSize={useTwoCols ? '.8rem' : '.9rem'}>
                        {cand.Position?.Title || 'Student Council'}
                      </Typography>
                    </Box>

                    {/* Symbol */}
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: useTwoCols ? '1.3rem' : '1.8rem'
                    }}>
                      {cand.Symbol || '🗳️'}
                    </Box>

                    {/* EVM LED Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box sx={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: isVoted ? '#EF4444' : '#3F3F46',
                        boxShadow: isVoted ? '0 0 12px #EF4444, inset 0 0 4px #000' : 'inset 0 0 4px #000',
                        border: '2px solid #27272A',
                        animation: isVoted ? 'ledBlink 0.3s infinite alternate' : 'none',
                        '@keyframes ledBlink': {
                          from: { opacity: 0.4 },
                          to: { opacity: 1 }
                        }
                      }} />
                    </Box>

                    {/* Vote Button */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Button
                        variant="contained"
                        disabled={evmLocked}
                        onClick={() => { highlightNumpadKey(globalIdx + 1); playSelectBeep(); setTimeout(() => castVote(globalIdx), 300); }}
                        sx={{
                          minWidth: useTwoCols ? 76 : 110, py: useTwoCols ? 0.8 : 1.2, fontWeight: 800, fontSize: '.85rem',
                          background: isVoted ? '#22c55e' : 'linear-gradient(135deg, #10B981, #059669)',
                          borderRadius: '8px',
                          boxShadow: isActive ? '0 0 16px rgba(16,185,129,0.5)' : 'none',
                          '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 4px 20px rgba(16,185,129,0.4)' },
                          '&:disabled': { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)' }
                        }}
                      >
                        {isVoted ? '✓ VOTED' : `VOTE`}
                      </Button>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          );

          return useTwoCols ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {renderColumn(col1, col1Offset)}
              {renderColumn(col2, col2Offset)}
            </Box>
          ) : (
            renderColumn(col1, col1Offset)
          );
        })()}

        {candidates.length === 0 && (
          <Box sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h5" color="text.secondary">No candidates registered for this election.</Typography>
          </Box>
        )}
      </Box>

      {/* ── Footer ── */}
      <Box sx={{ p: '14px 32px', borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,37,64,.7)', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 3, fontSize: '.78rem', color: 'text.secondary' }}>
          <Box>📌 Press <span style={{ color: '#FF9933', fontWeight: 800 }}>Number 1-{len}</span> to vote for candidate</Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ px: 2, py: 0.5, borderRadius: 2, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', fontSize: '.72rem', color: '#ef4444', fontWeight: 700 }}>
            KEYBOARD LOCKED — NUMPAD ONLY
          </Box>
          <Box sx={{ px: 2, py: 0.5, borderRadius: 2, background: 'rgba(19,136,8,0.15)', border: '1px solid rgba(19,136,8,0.3)', fontSize: '.72rem', color: '#22c55e', fontWeight: 700 }}>
            VOTE IS ANONYMOUS
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default KioskMode;
