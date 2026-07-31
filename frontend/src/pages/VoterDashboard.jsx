import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, Chip, CircularProgress, Paper } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const VoterDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await api.get('/voter/elections');
        setElections(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchElections();
  }, []);

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress color="primary" /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0FDFA' }}>
      {/* Sticky Top Navbar */}
      <Box sx={{ 
        px: { xs: 2.5, sm: 4 }, 
        py: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        background: '#FFFFFF', 
        borderBottom: '3px solid #0F766E',
        boxShadow: '0 4px 20px rgba(15,118,110,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <img src="/logo.png" alt="VoteVerse AI" style={{ height: 48, objectFit: 'contain' }} />
          <Box>
            <Typography variant="h6" fontWeight={800} color="#134E4A" sx={{ lineHeight: 1.2 }}>VoteVerse AI</Typography>
            <Typography variant="caption" color="#475569" fontWeight={600}>
              Student: {user?.fullName} ({user?.voterRegistrationNumber})
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" color="inherit" onClick={logout} startIcon={<LogoutIcon />} sx={{ borderColor: '#CBD5E1', color: '#475569' }}>
          Logout
        </Button>
      </Box>

      {/* Content Container */}
      <Box sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="#134E4A" sx={{ letterSpacing: -0.5 }}>
              Campus Elections
            </Typography>
            <Typography variant="body2" color="#475569" mt={0.5}>
              Participate in active student council and university department elections.
            </Typography>
          </Box>
        </Box>

        {user?.hasVoted && (
          <Paper sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 4, 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%)', 
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <CheckCircleOutlineIcon sx={{ fontSize: 36, color: '#10B981' }} />
            <Box>
              <Typography variant="h6" color="#059669" fontWeight={700}>Vote Recorded Successfully</Typography>
              <Typography variant="body2" color="#475569">
                Thank you for voting! Your ballot is encrypted and securely stored in the campus ledger.
              </Typography>
            </Box>
          </Paper>
        )}

        <Grid container spacing={3}>
          {elections.map(e => (
            <Grid item xs={12} md={6} key={e.ElectionID}>
              <Card sx={{ 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                background: '#FFFFFF',
                border: '1px solid #CCFBF1',
                borderRadius: 4,
                boxShadow: '0 10px 30px -5px rgba(15, 118, 110, 0.06)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: '0 20px 35px -5px rgba(15, 118, 110, 0.12)',
                  borderColor: '#0F766E',
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
                      backgroundColor: e.Status === 'Live' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                      color: e.Status === 'Live' ? '#059669' : '#D97706'
                    }} 
                  />
                  <Typography variant="h5" fontWeight={700} color="#134E4A">{e.Title}</Typography>
                  <Typography variant="body2" color="#475569" mt={1}>{e.Description}</Typography>
                </Box>
                
                <Box mt="auto" pt={3}>
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
                      fontWeight: 600,
                      backgroundColor: '#0F766E',
                      '&:hover': { backgroundColor: '#115E59' }
                    }}
                  >
                    {user?.hasVoted ? 'VOTE CAST' : (e.Status === 'Live' ? 'ENTER VOTING BOOTH' : 'NOT YET ACTIVE')}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
          
          {elections.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', background: '#FFFFFF', border: '1px solid #CCFBF1', borderRadius: 4 }}>
                <Typography color="#475569" fontWeight={500}>
                  No active remote elections at this time. AVS elections require in-person voting.
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default VoterDashboard;
