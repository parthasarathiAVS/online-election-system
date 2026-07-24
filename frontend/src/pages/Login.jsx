import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, Typography, TextField, Button, Alert, CircularProgress, Paper, InputAdornment, Link } from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { loginAdmin, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate(`/${user.role}`);
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await loginAdmin(username, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your Student ID / Officer Username and password.');
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
      background: 'linear-gradient(135deg, #0F766E 0%, #06B6D4 50%, #4338CA 100%)',
      position: 'relative',
      overflow: 'hidden',
      p: 2.5
    }}>
      {/* Animated Floating Shapes */}
      <Box className="floating-shape-1" sx={{
        position: 'absolute',
        top: '10%',
        left: '8%',
        width: 140,
        height: 140,
        borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(10px)',
        pointerEvents: 'none'
      }} />
      <Box className="floating-shape-2" sx={{
        position: 'absolute',
        bottom: '12%',
        right: '10%',
        width: 180,
        height: 180,
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        pointerEvents: 'none'
      }} />
      <Box className="floating-shape-1" sx={{
        position: 'absolute',
        bottom: '25%',
        left: '12%',
        width: 90,
        height: 90,
        borderRadius: '20px',
        transform: 'rotate(45deg)',
        background: 'rgba(255, 255, 255, 0.08)',
        pointerEvents: 'none'
      }} />

      {/* Center Glassmorphism Login Card */}
      <Paper className="slide-up glass" sx={{
        width: '100%',
        maxWidth: 450,
        position: 'relative',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 30px 60px -12px rgba(15, 118, 110, 0.25), 0 18px 36px -18px rgba(6, 182, 212, 0.3)'
      }}>
        {/* Top Accent Bar */}
        <Box sx={{ height: 6, background: 'linear-gradient(90deg, #0F766E 0%, #06B6D4 50%, #4338CA 100%)' }} />

        <Box sx={{ p: { xs: 3.5, sm: 5 } }}>
          {/* Logo & Welcome Header */}
          <Box textAlign="center" mb={4}>
            {/* College Logo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <img
                src="/college_logo.png"
                alt="AVS College of Technology"
                style={{ height: 72, objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h5" fontWeight={800} color="#134E4A" sx={{ letterSpacing: -0.3, lineHeight: 1.2 }}>
              AVS College of Technology
            </Typography>
            <Typography variant="caption" color="#475569" fontWeight={500} mt={0.5} display="block">
              Approved by AICTE | Affiliated to Anna University
            </Typography>
            <Box sx={{ mt: 1.5, py: 0.6, px: 2, display: 'inline-block', borderRadius: 5, background: 'rgba(15, 118, 110, 0.08)' }}>
              <Typography variant="caption" color="#0F766E" fontWeight={600}>
                Welcome to the Student & Officer Portal
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 3, fontWeight: 500 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box mb={2.5}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#134E4A', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                STUDENT ID / OFFICER USERNAME
              </Typography>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Enter Student ID or Officer Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoComplete="off"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: '#0F766E' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box mb={2.5}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#134E4A', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                PASSWORD
              </Typography>
              <TextField
                fullWidth
                type="password"
                variant="outlined"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#0F766E' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box display="flex" justifyContent="flex-end" mb={3}>
              <Link 
                href="#" 
                onClick={(e) => { e.preventDefault(); alert('Please contact your Campus Election Administrator to reset your password.'); }}
                underline="hover" 
                variant="caption" 
                sx={{ color: '#0F766E', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Button 
              type="submit" 
              fullWidth 
              variant="contained" 
              color="primary"
              size="large"
              disabled={submitting}
              sx={{ 
                py: 1.6, 
                fontSize: '1rem', 
                fontWeight: 600,
                backgroundColor: '#0F766E',
                '&:hover': { backgroundColor: '#115E59' }
              }}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <HowToVoteIcon />}
            >
              {submitting ? 'Authenticating...' : 'Sign In to Vote'}
            </Button>
          </form>

          {/* Security Footer Badge */}
          <Box textAlign="center" mt={4} pt={3} borderTop="1px solid #CCFBF1" display="flex" alignItems="center" justifyContent="center" gap={1}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
            <Typography variant="caption" color="#475569" fontWeight={600}>
              Official & Secure Campus Governance Portal
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
