import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  Paper, InputAdornment, Link, Divider, Tabs, Tab, IconButton
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const TABS = { STUDENT: 0, ADMIN: 1 };

const Login = () => {
  const [tab, setTab] = useState(TABS.STUDENT);
  const [showPassword, setShowPassword] = useState(false);

  // Student fields
  const [identifier, setIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Admin fields
  const [username, setUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginAdmin, loginStudent, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'voter') navigate('/voter', { replace: true });
      else if (user.role === 'student') navigate('/student', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleTabChange = (_, newVal) => {
    setTab(newVal);
    setError('');
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginStudent(identifier, studentPassword);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginAdmin(username, adminPassword);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6d28d9 75%, #7c3aed 100%)',
      position: 'relative',
      overflow: 'hidden',
      p: 2.5
    }}>
      {/* Animated Background Orbs */}
      <Box className="floating-shape-1" sx={{
        position: 'absolute', top: '5%', left: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <Box className="floating-shape-2" sx={{
        position: 'absolute', bottom: '5%', right: '5%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none'
      }} />
      <Box className="floating-shape-1" sx={{
        position: 'absolute', top: '40%', right: '15%',
        width: 150, height: 150, borderRadius: '30%',
        background: 'rgba(129,140,248,0.12)',
        backdropFilter: 'blur(8px)', pointerEvents: 'none',
        transform: 'rotate(20deg)'
      }} />

      {/* Glassmorphism Card */}
      <Paper className="slide-up" sx={{
        width: '100%',
        maxWidth: 460,
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)'
      }}>
        {/* Rainbow top accent */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #818cf8, #a78bfa, #c084fc, #e879f9, #f472b6)' }} />

        <Box sx={{ p: { xs: 3.5, sm: 5 } }}>
          {/* Logo & Title */}
          <Box textAlign="center" mb={4}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '20px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(99,102,241,0.3)'
              }}>
                <img src="/logo.png" alt="VoteVerse AI"
                  style={{ height: 60, objectFit: 'contain' }} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #ffffff, #c7d2fe)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: -0.5
            }}>
              VoteVerse AI
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(199,210,254,0.8)', mt: 0.5, fontWeight: 500 }}>
              Welcome Back! Sign in to continue.
            </Typography>
          </Box>

          {/* Role Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              '& .MuiTabs-root': { minHeight: 44 },
              '& .MuiTab-root': {
                color: 'rgba(199,210,254,0.6)',
                fontWeight: 600,
                fontSize: '0.85rem',
                minHeight: 44,
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&.Mui-selected': { color: '#fff' }
              },
              '& .MuiTabs-indicator': {
                background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
                borderRadius: '3px',
                height: 3
              }
            }}
          >
            <Tab icon={<SchoolOutlinedIcon fontSize="small" />} iconPosition="start" label="Student" id="tab-student" />
            <Tab icon={<AdminPanelSettingsOutlinedIcon fontSize="small" />} iconPosition="start" label="Admin" id="tab-admin" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{
              mb: 3, borderRadius: 3, fontWeight: 500,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              '& .MuiAlert-icon': { color: '#f87171' }
            }}>
              {error}
            </Alert>
          )}

          {/* ── Student Login ── */}
          {tab === TABS.STUDENT && (
            <form onSubmit={handleStudentLogin} id="student-login-form">
              <Box mb={2.5}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(199,210,254,0.8)', letterSpacing: 0.8, mb: 1, display: 'block' }}>
                  EMAIL OR REGISTER NUMBER
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter email or register number"
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Box>

              <Box mb={1}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(199,210,254,0.8)', letterSpacing: 0.8, mb: 1, display: 'block' }}>
                  PASSWORD
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  placeholder="••••••••"
                  value={studentPassword}
                  onChange={e => setStudentPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(p => !p)} edge="end" sx={{ color: 'rgba(199,210,254,0.6)' }}>
                          {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={inputStyle}
                />
              </Box>

              <Box display="flex" justifyContent="flex-end" mb={3} mt={1}>
                <Link href="#" underline="hover" variant="caption"
                  onClick={e => { e.preventDefault(); alert('Please contact your Campus Election Administrator to reset your password.'); }}
                  sx={{ color: '#a5b4fc', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot Password?
                </Link>
              </Box>

              <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <HowToVoteIcon />}
                sx={submitBtnStyle('#4f46e5', '#6d28d9')}>
                {submitting ? 'Signing in...' : 'Sign In'}
              </Button>

              <Divider sx={{ my: 3, '&::before, &::after': { borderColor: 'rgba(255,255,255,0.15)' } }}>
                <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.5)', px: 1 }}>OR</Typography>
              </Divider>

              <Button fullWidth variant="outlined" size="large"
                component={RouterLink} to="/register"
                sx={outlineBtnStyle}>
                Create Account
              </Button>

              <Box textAlign="center" mt={2.5}>
                <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.5)' }}>
                  Don't have an account?{' '}
                  <Link component={RouterLink} to="/register" underline="hover"
                    sx={{ color: '#a5b4fc', fontWeight: 700, ml: 0.5 }}>
                    Register Now
                  </Link>
                </Typography>
              </Box>
            </form>
          )}

          {/* ── Admin Login ── */}
          {tab === TABS.ADMIN && (
            <form onSubmit={handleAdminLogin} id="admin-login-form">
              <Box mb={2.5}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(199,210,254,0.8)', letterSpacing: 0.8, mb: 1, display: 'block' }}>
                  ADMIN USERNAME
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Box>

              <Box mb={1}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'rgba(199,210,254,0.8)', letterSpacing: 0.8, mb: 1, display: 'block' }}>
                  PASSWORD
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(p => !p)} edge="end" sx={{ color: 'rgba(199,210,254,0.6)' }}>
                          {showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={inputStyle}
                />
              </Box>

              <Box display="flex" justifyContent="flex-end" mb={3} mt={1}>
                <Link href="#" underline="hover" variant="caption"
                  onClick={e => { e.preventDefault(); alert('Contact Super Admin for password reset.'); }}
                  sx={{ color: '#a5b4fc', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot Password?
                </Link>
              </Box>

              <Button type="submit" fullWidth variant="contained" size="large" disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AdminPanelSettingsOutlinedIcon />}
                sx={submitBtnStyle('#4f46e5', '#6d28d9')}>
                {submitting ? 'Authenticating...' : 'Admin Sign In'}
              </Button>
            </form>
          )}

          {/* Footer */}
          <Box textAlign="center" mt={4} pt={3} borderTop="1px solid rgba(255,255,255,0.08)"
            display="flex" alignItems="center" justifyContent="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 2s infinite' }} />
            <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.5)', fontWeight: 600 }}>
              Secured Campus Governance Platform
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

// ── Shared Styles ─────────────────────────────────────────────
const inputStyle = {
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '12px',
    color: '#e0e7ff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
    '&:hover fieldset': { borderColor: 'rgba(129,140,248,0.6)' },
    '&.Mui-focused fieldset': { borderColor: '#818cf8', borderWidth: '2px' },
  },
  '& input::placeholder': { color: 'rgba(199,210,254,0.4)', opacity: 1 },
  '& input': { color: '#e0e7ff' }
};

const submitBtnStyle = (from, to) => ({
  py: 1.6,
  fontSize: '1rem',
  fontWeight: 700,
  background: `linear-gradient(135deg, ${from}, ${to})`,
  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
  borderRadius: '14px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(99,102,241,0.55)',
    background: `linear-gradient(135deg, ${from}, ${to})`
  }
});

const outlineBtnStyle = {
  py: 1.5,
  fontSize: '0.95rem',
  fontWeight: 700,
  border: '2px solid rgba(129,140,248,0.5)',
  color: '#a5b4fc',
  borderRadius: '14px',
  background: 'rgba(99,102,241,0.08)',
  transition: 'all 0.3s ease',
  '&:hover': {
    border: '2px solid #818cf8',
    background: 'rgba(99,102,241,0.2)',
    transform: 'translateY(-2px)',
    color: '#e0e7ff'
  }
};

export default Login;


