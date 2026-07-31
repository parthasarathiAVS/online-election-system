import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, Chip, CircularProgress,
  Paper, Avatar, Divider, Alert
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EventNoteIcon from '@mui/icons-material/EventNote';

const StudentDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/student/elections');
        setElections(res.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch campus elections.');
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
        <CircularProgress color="secondary" />
      </Box>
    );
  }

  // Base URL for backend uploads
  const backendBaseUrl = 'https://online-election-system-9sx9.onrender.com';

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#f8fafc'
    }}>
      {/* Navbar */}
      <Box sx={{
        px: { xs: 2.5, sm: 4 },
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(30, 27, 75, 0.4)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src="/logo.png" alt="VoteVerse AI" sx={{ width: 44, height: 44, border: '1px solid rgba(255,255,255,0.2)' }} />
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #ffffff, #c7d2fe)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              lineHeight: 1.2
            }}>
              VoteVerse AI
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.6)', fontWeight: 600 }}>
              Student Portal
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          color="inherit"
          onClick={logout}
          startIcon={<LogoutIcon />}
          sx={{
            borderColor: 'rgba(255,255,255,0.18)',
            color: '#a5b4fc',
            textTransform: 'none',
            borderRadius: '10px',
            '&:hover': {
              borderColor: '#818cf8',
              background: 'rgba(99,102,241,0.08)'
            }
          }}
        >
          Logout
        </Button>
      </Box>

      {/* Main Content */}
      <Box sx={{ p: { xs: 3, sm: 5 }, maxWidth: 1200, margin: '0 auto', width: '100%', flexGrow: 1 }}>
        <Grid container spacing={4}>
          
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper className="glass" sx={{
              p: 4,
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '24px',
              color: '#f8fafc',
              height: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
            }}>
              <Avatar
                src={user?.profilePhoto ? `${backendBaseUrl}${user.profilePhoto}` : ''}
                alt={user?.fullName}
                sx={{
                  width: 110,
                  height: 110,
                  margin: '0 auto 20px',
                  border: '3px solid #818cf8',
                  boxShadow: '0 8px 24px rgba(99,102,241,0.3)'
                }}
              />
              <Typography variant="h5" fontWeight={800} sx={{ mb: 0.5 }}>
                {user?.fullName}
              </Typography>
              <Typography variant="body2" sx={{ color: '#a5b4fc', fontWeight: 600, mb: 3 }}>
                Reg No: {user?.registrationNumber}
              </Typography>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2.5 }} />

              <Box sx={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <SchoolIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.5)', display: 'block', lineHeight: 1 }}>College</Typography>
                    <Typography variant="body2" fontWeight={600}>{user?.collegeName || 'N/A'}</Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <SchoolIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.5)', display: 'block', lineHeight: 1 }}>Department</Typography>
                    <Typography variant="body2" fontWeight={600}>{user?.department} ({user?.year})</Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <EmailIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.5)', display: 'block', lineHeight: 1 }}>Email Address</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>{user?.email}</Typography>
                  </Box>
                </Box>

                <Box display="flex" alignItems="center" gap={1.5}>
                  <PhoneIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.5)', display: 'block', lineHeight: 1 }}>Mobile Number</Typography>
                    <Typography variant="body2" fontWeight={600}>{user?.phone || 'N/A'}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Elections Section */}
          <Grid item xs={12} md={8}>
            <Box mb={4}>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5, mb: 1 }}>
                Upcoming & Active Elections
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(199,210,254,0.6)' }}>
                Please review active digital ballots and cast your vote before the end date.
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>{error}</Alert>
            )}

            {user?.hasVoted && (
              <Paper sx={{
                p: 3, mb: 4, borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.04) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex', alignItems: 'center', gap: 2,
                color: '#a7f3d0'
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 36, color: '#34d399' }} />
                <Box>
                  <Typography variant="h6" color="#34d399" fontWeight={700}>Your Vote is Securely cast</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(199,210,254,0.8)' }}>
                    Thank you! Your voting history is auto-locked and encrypted in our database.
                  </Typography>
                </Box>
              </Paper>
            )}

            <Grid container spacing={3}>
              {elections.map(e => (
                <Grid item xs={12} sm={6} key={e.ElectionID}>
                  <Card sx={{
                    p: 3.5,
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.04)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    transition: 'all 0.25s ease',
                    color: '#f8fafc',
                    '&:hover': {
                      border: '1px solid rgba(129,140,248,0.4)',
                      transform: 'translateY(-3px)'
                    }
                  }}>
                    <Box mb={2}>
                      <Chip
                        size="small"
                        label={e.Status}
                        sx={{
                          mb: 1.5,
                          fontWeight: 700,
                          backgroundColor: e.Status === 'Live' ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                          color: e.Status === 'Live' ? '#34d399' : '#fbbf24'
                        }}
                      />
                      <Typography variant="h5" fontWeight={700}>{e.Title}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(199,210,254,0.6)', mt: 1 }}>{e.Description}</Typography>
                    </Box>

                    <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EventNoteIcon sx={{ color: '#818cf8', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.6)' }}>
                          Starts: {new Date(e.StartTime).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EventNoteIcon sx={{ color: '#818cf8', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ color: 'rgba(199,210,254,0.6)' }}>
                          Ends: {new Date(e.EndTime).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box mt="auto" pt={2.5}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={e.Status !== 'Live' || user?.hasVoted}
                        onClick={() => navigate(`/voter/booth/${e.ElectionID}`)}
                        startIcon={<HowToVoteIcon />}
                        sx={{
                          py: 1.4,
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
                          borderRadius: '12px',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #4338ca, #5b21b6)',
                          }
                        }}
                      >
                        {user?.hasVoted ? 'VOTE RECORDED' : (e.Status === 'Live' ? 'ENTER VOTING BOOTH' : 'NOT ACTIVE')}
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              ))}

              {elections.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{
                    p: 6,
                    textAlign: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px',
                    color: 'rgba(199,210,254,0.6)'
                  }}>
                    <Typography fontWeight={500}>
                      No active remote elections at this time.
                    </Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default StudentDashboard;
