import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Paper, Avatar, Chip } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const VotingBooth = () => {
  const { electionId } = useParams();
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [casting, setCasting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/voter/elections/${electionId}`);
        setElection(res.data.election);
        setCandidates(res.data.candidates);
      } catch (err) {
        alert(err.response?.data?.message || 'Error loading voting booth.');
        navigate('/voter');
      }
      setLoading(false);
    };
    fetchData();
  }, [electionId, navigate]);

  const handleVote = async () => {
    if (!selectedCandidate) return;
    setCasting(true);
    try {
      const res = await api.post('/voter/vote', { electionId, candidateId: selectedCandidate.CandidateID });
      setReceipt(res.data.receipt);
      setUser(prev => ({ ...prev, hasVoted: true }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error casting vote');
      setCasting(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress color="primary" /></Box>;

  if (receipt) {
    return (
      <Box sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2.5,
        background: 'linear-gradient(135deg, #F0FDFA 0%, #ECFDF5 50%, #EEF2FF 100%)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'none',
        '& *': { cursor: 'none !important' }
      }}>
        {/* Background Glow Orbs */}
        <Box sx={{ position: 'absolute', top: '15%', left: '10%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: '10%', right: '8%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <Paper className="slide-up" sx={{
          maxWidth: 520,
          width: '100%',
          borderRadius: '24px',
          background: '#FFFFFF',
          border: '1px solid #CCFBF1',
          boxShadow: '0 30px 60px -12px rgba(15,118,110,0.15)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Top gradient stripe */}
          <Box sx={{ height: 6, background: 'linear-gradient(90deg, #0F766E 0%, #10B981 50%, #06B6D4 100%)' }} />

          <Box sx={{ p: { xs: 3.5, sm: 5 }, textAlign: 'center' }}>

            {/* ── Candidate Photo & Voted Badge ── */}
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              {/* Outer glow ring */}
              <Box sx={{
                position: 'absolute', inset: -6,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #06B6D4)',
                animation: 'spin 4s linear infinite',
                '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } }
              }} />
              {/* White gap ring */}
              <Box sx={{ position: 'absolute', inset: -3, borderRadius: '50%', background: '#FFFFFF' }} />

              {/* Candidate Photo */}
              <Avatar
                src={selectedCandidate.PhotoURL || ''}
                sx={{
                  width: 120,
                  height: 120,
                  fontSize: '3.5rem',
                  border: `4px solid ${selectedCandidate.Color || '#10B981'}`,
                  background: selectedCandidate.PhotoURL
                    ? 'transparent'
                    : `${selectedCandidate.Color || '#10B981'}22`,
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: `0 12px 30px ${selectedCandidate.Color || '#10B981'}44`
                }}
              >
                {!selectedCandidate.PhotoURL && selectedCandidate.Symbol}
              </Avatar>

              {/* ✓ Voted Badge */}
              <Box sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: '3px solid #FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                boxShadow: '0 4px 12px rgba(16,185,129,0.5)'
              }}>
                <CheckCircleIcon sx={{ fontSize: 20, color: '#FFFFFF' }} />
              </Box>
            </Box>

            {/* Vote Confirmed Heading */}
            <Box sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2.5,
              py: 0.8,
              borderRadius: '20px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              mb: 2
            }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: '#10B981' }} />
              <Typography variant="caption" color="#059669" fontWeight={800} sx={{ letterSpacing: 1 }}>
                VOTE CONFIRMED
              </Typography>
            </Box>

            <Typography variant="h4" fontWeight={800} color="#134E4A" sx={{ letterSpacing: -0.5, lineHeight: 1.2, mb: 0.5 }}>
              Vote Successfully Cast!
            </Typography>
            <Typography variant="body2" color="#475569" mb={3}>
              Your encrypted ballot has been recorded in the campus ledger.
            </Typography>

            {/* ── Voted Candidate Card ── */}
            <Box sx={{
              background: 'linear-gradient(135deg, rgba(15,118,110,0.06) 0%, rgba(6,182,212,0.04) 100%)',
              border: `2px solid ${selectedCandidate.Color || '#10B981'}44`,
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
                src={selectedCandidate.PhotoURL || ''}
                sx={{
                  width: 56,
                  height: 56,
                  fontSize: '1.6rem',
                  border: `2px solid ${selectedCandidate.Color || '#10B981'}`,
                  background: `${selectedCandidate.Color || '#10B981'}22`,
                  flexShrink: 0
                }}
              >
                {!selectedCandidate.PhotoURL && selectedCandidate.Symbol}
              </Avatar>

              <Box flex={1} minWidth={0}>
                <Typography variant="caption" color="#475569" fontWeight={700} sx={{ letterSpacing: 1 }} display="block">
                  YOU VOTED FOR
                </Typography>
                <Typography variant="h6" fontWeight={800} color="#134E4A" noWrap>
                  {selectedCandidate.FullName}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={0.3}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: selectedCandidate.Color || '#10B981', flexShrink: 0 }} />
                  <Typography variant="body2" color={selectedCandidate.Color || '#0F766E'} fontWeight={600} noWrap>
                    {selectedCandidate.Party}
                  </Typography>
                </Box>
              </Box>

              {/* Big symbol */}
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: `${selectedCandidate.Color || '#10B981'}15`,
                border: `1.5px solid ${selectedCandidate.Color || '#10B981'}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                flexShrink: 0
              }}>
                {selectedCandidate.Symbol}
              </Box>
            </Box>

            {/* Cryptographic receipt */}
            <Box sx={{ background: '#F0FDFA', p: 2, borderRadius: 2, mb: 3.5, border: '1px solid #CCFBF1', textAlign: 'left' }}>
              <Typography variant="caption" color="#475569" fontWeight={700} display="block" mb={0.5} sx={{ letterSpacing: 1 }}>
                🔐 CRYPTOGRAPHIC BALLOT RECEIPT
              </Typography>
              <Typography variant="body2" fontFamily="monospace" color="#0F766E" fontWeight={700} sx={{ wordBreak: 'break-all', fontSize: '0.72rem' }}>
                {receipt}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/voter')}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                backgroundColor: '#0F766E',
                '&:hover': { backgroundColor: '#115E59' }
              }}
            >
              Return to Student Portal
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', background: '#F0FDFA', display: 'flex', flexDirection: 'column', cursor: 'none', '& *': { cursor: 'none !important' } }}>
      {/* Top Header / Sticky Bar */}
      <Box sx={{ 
        px: { xs: 2.5, sm: 4 }, 
        py: 2, 
        background: '#FFFFFF', 
        borderBottom: '3px solid #0F766E', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(15,118,110,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Box display="flex" alignItems="center" gap={2}>
          <img src="/college_logo.png" alt="AVS College of Technology" style={{ height: 44, objectFit: 'contain' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="#134E4A" sx={{ lineHeight: 1.2 }}>SECURE VOTING BOOTH</Typography>
            <Typography variant="caption" color="#475569" fontWeight={600}>{election.Title}</Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          {/* Status Badge */}
          <Chip 
            size="small" 
            label="LIVE ELECTION" 
            sx={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#059669', fontWeight: 800, fontSize: '0.75rem' }} 
          />
          {/* Encrypted Badge */}
          <Box display="flex" alignItems="center" gap={1} sx={{ px: 2, py: 0.8, background: 'rgba(15,118,110,0.08)', borderRadius: 2, border: '1px solid rgba(15,118,110,0.2)' }}>
            <LockIcon sx={{ fontSize: 16, color: '#0F766E' }} />
            <Typography variant="caption" fontWeight={700} color="#0F766E">256-BIT ENCRYPTED</Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Candidate Grid */}
      <Box sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 1000, mx: 'auto', width: '100%', flex: 1 }}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight={800} color="#134E4A" sx={{ letterSpacing: -0.5 }}>
            Select Your Candidate
          </Typography>
          <Typography variant="body2" color="#475569" mt={0.5}>
            Click on a candidate card to select your choice, then confirm your vote below.
          </Typography>
        </Box>

        <Grid container spacing={3} columns={candidates.length > 5 ? 2 : 12}>
          {candidates.map((c) => {
            const isSelected = selectedCandidate?.CandidateID === c.CandidateID;
            return (
              <Grid item xs={candidates.length > 5 ? 1 : 12} sm={candidates.length > 5 ? 1 : 6} key={c.CandidateID}>
                <Paper 
                  onClick={() => setSelectedCandidate(c)}
                  elevation={isSelected ? 4 : 0}
                  sx={{ 
                    p: candidates.length > 5 ? 2.5 : 3, 
                    borderRadius: 4, 
                    cursor: 'pointer', 
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isSelected ? 'rgba(16, 185, 129, 0.05)' : '#FFFFFF',
                    border: `2px solid ${isSelected ? '#10B981' : '#CCFBF1'}`,
                    boxShadow: isSelected 
                      ? '0 0 20px rgba(16, 185, 129, 0.35), 0 10px 25px -5px rgba(16, 185, 129, 0.2)' 
                      : '0 10px 25px -5px rgba(15, 118, 110, 0.04)',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: candidates.length > 5 ? 2 : 3,
                    '&:hover': {
                      borderColor: isSelected ? '#10B981' : '#0F766E',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Avatar sx={{ 
                    width: candidates.length > 5 ? 52 : 64, 
                    height: candidates.length > 5 ? 52 : 64, 
                    background: `${c.Color || '#0F766E'}18`, 
                    border: `2px solid ${c.Color || '#0F766E'}`, 
                    fontSize: candidates.length > 5 ? '1.5rem' : '2rem', 
                    flexShrink: 0 
                  }}>
                    {c.PhotoURL ? <img src={c.PhotoURL} alt={c.FullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : c.Symbol}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant={candidates.length > 5 ? 'body1' : 'h6'} fontWeight={800} color="#134E4A">{c.FullName}</Typography>
                    <Typography variant="body2" color="#0F766E" fontWeight={600}>{c.Party}</Typography>
                  </Box>
                  {isSelected && (
                    <Chip 
                      size="small" 
                      label="SELECTED" 
                      sx={{ backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: 800 }} 
                    />
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Vote Button */}
        <Box mt={6} textAlign="center">
          <Button 
            variant="contained" 
            size="large" 
            disabled={!selectedCandidate || casting}
            onClick={handleVote}
            sx={{ 
              px: 6, 
              py: 1.8, 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              borderRadius: 3,
              backgroundColor: selectedCandidate ? '#10B981' : '#0F766E',
              '&:hover': {
                backgroundColor: selectedCandidate ? '#059669' : '#115E59'
              },
              boxShadow: selectedCandidate ? '0 8px 25px rgba(16, 185, 129, 0.4)' : 'none'
            }}
            startIcon={casting ? <CircularProgress size={24} color="inherit"/> : <LockIcon />}
          >
            {casting ? 'ENCRYPTING VOTE...' : (selectedCandidate ? `CAST VOTE FOR ${selectedCandidate.FullName.toUpperCase()}` : 'SELECT A CANDIDATE TO VOTE')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VotingBooth;
