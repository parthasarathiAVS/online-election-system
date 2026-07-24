import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Box, Typography, Button, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Avatar, 
  CircularProgress, Alert, Chip, Divider 
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const ResultsPrint = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [resultsData, setResultsData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultsRes, statsRes] = await Promise.all([
          api.get(`/admin/results/${electionId}`),
          api.get(`/admin/dashboard?electionId=${electionId}`)
        ]);
        setResultsData(resultsRes.data);
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Error loading election results.');
      }
      setLoading(false);
    };

    fetchData();
  }, [electionId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
        <CircularProgress color="primary" />
        <Typography>Generating Official Certificate...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4} maxWidth={600} margin="0 auto">
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => navigate('/admin')} startIcon={<ArrowBackIcon />}>
            Back to Dashboard
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  const { results, electionTitle } = resultsData;
  const winner = results && results.length > 0 ? results[0] : null;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: '#090d16', 
      py: 6, 
      px: 3,
      '@media print': {
        background: '#ffffff',
        py: 0,
        px: 0,
      }
    }}>
      {/* Action Bar (Hidden during print) */}
      <Box className="no-print" sx={{ 
        maxWidth: 842, 
        margin: '0 auto 24px auto', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin')}
          sx={{ color: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)' }}
        >
          Back to Dashboard
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ fontWeight: 800 }}
        >
          Print Certificate
        </Button>
      </Box>

      {/* CSS style tag for page printing setups */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 12pt;
          }
          /* Remove page headers/footers default margin */
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          .certificate-card {
            border: 2px solid #000000 !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }
          .print-text-dark {
            color: #000000 !important;
          }
          .print-text-mute {
            color: #475569 !important;
          }
          .print-border {
            border-color: #cbd5e1 !important;
          }
          .print-avatar {
            border: 1px solid #000000 !important;
            color: #000000 !important;
            background: transparent !important;
          }
          .winner-section {
            border: 2px solid #138808 !important;
            background: rgba(19,136,8,0.05) !important;
          }
        }
      `}} />

      {/* Official Certificate Card */}
      <Paper 
        className="certificate-card"
        elevation={8}
        sx={{
          maxWidth: 842,
          margin: '0 auto',
          background: '#0f172a', // Slate 900
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 4,
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* Teal & Cyan Accent Bar */}
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          height: 6, 
          background: 'linear-gradient(90deg, #0F766E 0%, #06B6D4 50%, #4338CA 100%)' 
        }} />

        {/* Certificate Watermark Icon */}
        <VerifiedUserIcon sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 400,
          color: 'rgba(255, 255, 255, 0.015)',
          pointerEvents: 'none',
          zIndex: 0,
          '@media print': {
            color: 'rgba(0, 0, 0, 0.025)'
          }
        }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Official Seal / Header */}
          <Box textAlign="center" mb={4}>
            <Box display="inline-flex" alignItems="center" justifyContent="center" mb={1} sx={{ color: '#0F766E' }}>
              <VerifiedUserIcon sx={{ fontSize: 44, color: '#0F766E', '@media print': { color: '#000000' } }} />
            </Box>
            <Typography 
              variant="overline" 
              className="print-text-dark"
              sx={{ 
                letterSpacing: 4, 
                fontWeight: 900, 
                color: '#0F766E', 
                fontSize: '0.9rem',
                display: 'block',
                '@media print': { color: '#000000' }
              }}
            >
              COLLEGE CAMPUS ELECTION SYSTEM
            </Typography>
            <Typography 
              variant="h4" 
              className="print-text-dark"
              fontWeight={900} 
              color="text.primary" 
              sx={{ mt: 1, letterSpacing: -0.5 }}
            >
              Election Results Certificate
            </Typography>
            <Typography variant="body2" className="print-text-mute" color="text.secondary" sx={{ mt: 0.5 }}>
              Secure Audited Ledger Output • Form 20-C
            </Typography>
          </Box>

          <Divider className="print-border" sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

          {/* Metadata Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">ELECTION TITLE</Typography>
              <Typography variant="body1" className="print-text-dark" fontWeight={700} color="text.primary">{electionTitle}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">ELECTION ID</Typography>
              <Typography variant="body1" className="print-text-dark" fontWeight={700} color="text.primary">#ELEC-{electionId}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">DATE COMPLETED</Typography>
              <Typography variant="body1" className="print-text-dark" fontWeight={700} color="text.primary">
                {stats?.endTime ? new Date(stats.endTime).toLocaleString() : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">STATUS</Typography>
              <Chip 
                size="small" 
                label={stats?.electionStatus || 'Ended'} 
                color="success" 
                sx={{ 
                  fontWeight: 800, 
                  fontSize: '0.75rem',
                  mt: 0.5,
                  '@media print': {
                    border: '1px solid #000000',
                    background: 'transparent',
                    color: '#000000'
                  }
                }} 
              />
            </Grid>
          </Grid>

          {/* Winner Showcase Section */}
          {winner && (
            <Box className="winner-section" sx={{
              p: 3,
              mb: 4,
              borderRadius: 3,
              background: 'rgba(19, 136, 8, 0.05)',
              border: '1px solid rgba(19, 136, 8, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}>
              <Box display="flex" alignItems="center" gap={2}>
                <EmojiEventsIcon sx={{ fontSize: 40, color: '#138808', '@media print': { color: '#000000' } }} />
                <Box>
                  <Typography variant="caption" className="print-text-mute" color="#4ade80" fontWeight={800} sx={{ letterSpacing: 1, display: 'block', '@media print': { color: '#000000' } }}>
                    DECLARED ELECTED WINNER
                  </Typography>
                  <Typography variant="h5" className="print-text-dark" fontWeight={900} color="text.primary">
                    {winner.FullName}
                  </Typography>
                  <Typography variant="body2" className="print-text-mute" color="text.secondary">
                    Representing the {winner.Party} Party
                  </Typography>
                </Box>
              </Box>
              <Box textAlign="right">
                <Typography variant="h4" className="print-text-dark" fontWeight={900} color="#4ade80" sx={{ '@media print': { color: '#000000' } }}>
                  {winner.VoteCount}
                </Typography>
                <Typography variant="caption" className="print-text-mute" color="text.secondary">
                  Total Votes Certified
                </Typography>
              </Box>
            </Box>
          )}

          {/* Results Table */}
          <Typography variant="h6" className="print-text-dark" fontWeight={800} mb={2}>Official Candidate Tally</Typography>
          {(() => {
            const useTwoColumns = results && results.length > 5;
            const col1 = useTwoColumns ? results.slice(0, Math.ceil(results.length / 2)) : results;
            const col2 = useTwoColumns ? results.slice(Math.ceil(results.length / 2)) : [];
            const col1Offset = 0;
            const col2Offset = Math.ceil(results.length / 2);

            const renderTable = (data, rankOffset) => (
              <TableContainer component={Box} className="print-border" sx={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                <Table size="small">
                  <TableHead sx={{ background: 'rgba(255,255,255,0.02)', '@media print': { background: '#cbd5e1' } }}>
                    <TableRow>
                      <TableCell className="print-text-dark print-border" sx={{ fontWeight: 800, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }}>Rank</TableCell>
                      <TableCell className="print-text-dark print-border" sx={{ fontWeight: 800, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }}>Symbol</TableCell>
                      <TableCell className="print-text-dark print-border" sx={{ fontWeight: 800, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }}>Candidate Name</TableCell>
                      <TableCell className="print-text-dark print-border" sx={{ fontWeight: 800, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }}>Party</TableCell>
                      <TableCell className="print-text-dark print-border" sx={{ fontWeight: 800, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }} align="right">Votes</TableCell>
                      <TableCell className="print-text-dark print-border" sx={{ fontWeight: 800, color: 'text.secondary', borderColor: 'rgba(255,255,255,0.06)' }} align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((r, index) => {
                      const pct = stats?.votesCast > 0 ? ((r.VoteCount / stats.votesCast) * 100).toFixed(1) : '0.0';
                      return (
                        <TableRow key={r.CandidateID} sx={{ '&:hover': { background: 'rgba(255,255,255,0.01)' } }}>
                          <TableCell className="print-text-dark print-border" sx={{ fontWeight: 700, borderColor: 'rgba(255,255,255,0.04)' }}>#{rankOffset + index + 1}</TableCell>
                          <TableCell className="print-text-dark print-border" sx={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <Avatar className="print-avatar" sx={{ 
                              width: 28, height: 28, fontSize: '0.85rem',
                              background: `${r.Color}22`, border: `1.5px solid ${r.Color}`, color: '#ffffff'
                            }}>
                              {r.Symbol}
                            </Avatar>
                          </TableCell>
                          <TableCell className="print-text-dark print-border" sx={{ fontWeight: 800, borderColor: 'rgba(255,255,255,0.04)' }}>{r.FullName}</TableCell>
                          <TableCell className="print-text-dark print-border" sx={{ borderColor: 'rgba(255,255,255,0.04)', color: 'text.secondary' }}>{r.Party}</TableCell>
                          <TableCell className="print-text-dark print-border" sx={{ fontWeight: 900, borderColor: 'rgba(255,255,255,0.04)' }} align="right">{r.VoteCount}</TableCell>
                          <TableCell className="print-text-dark print-border" sx={{ fontWeight: 700, color: 'primary.main', borderColor: 'rgba(255,255,255,0.04)', '@media print': { color: '#000000' } }} align="right">{pct}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            );

            return useTwoColumns ? (
              <Box sx={{ display: 'flex', gap: 2, mb: 4, '@media print': { gap: 1 } }}>
                <Box flex={1}>{renderTable(col1, col1Offset)}</Box>
                <Box flex={1}>{renderTable(col2, col2Offset)}</Box>
              </Box>
            ) : (
              <Box sx={{ mb: 4 }}>
                {renderTable(col1, col1Offset)}
              </Box>
            );
          })()}

          {/* Audit & Turnout statistics */}
          <Grid container spacing={3} sx={{ mb: 5 }}>
            <Grid item xs={4}>
              <Box className="print-border" sx={{ p: 2, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">TOTAL REGISTERED VOTERS</Typography>
                <Typography variant="h5" className="print-text-dark" fontWeight={900} mt={0.5}>{stats?.totalVoters ?? '—'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box className="print-border" sx={{ p: 2, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">TOTAL VOTES RECORDED</Typography>
                <Typography variant="h5" className="print-text-dark" fontWeight={900} mt={0.5}>{stats?.votesCast ?? '—'}</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box className="print-border" sx={{ p: 2, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">VOTER TURNOUT</Typography>
                <Typography variant="h5" className="print-text-dark" fontWeight={900} mt={0.5} color="secondary.main" sx={{ '@media print': { color: '#000000' } }}>
                  {stats?.turnoutPercentage ?? '0.0'}%
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Official Verification Statement */}
          <Box className="print-border" sx={{ 
            p: 3, 
            borderRadius: 3, 
            background: 'rgba(255,255,255,0.01)', 
            border: '1px dashed rgba(255,255,255,0.08)',
            mb: 6,
            textAlign: 'center'
          }}>
            <Typography variant="body2" className="print-text-dark" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
              "This document is officially certified by the Election Officer. All recorded votes have been validated and cryptographically locked in the database. Any modification of this data would breach integrity hashes."
            </Typography>
          </Box>

          {/* Signature Block */}
          <Box sx={{ mt: 8, display: 'flex', justifyContent: 'space-between', px: 4 }}>
            <Box sx={{ textAlign: 'center', width: 220 }}>
              <Divider className="print-border" sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1, borderWidth: '1px' }} />
              <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">ELECTION COMMISSION OFFICER</Typography>
              <Typography variant="body2" className="print-text-dark" fontWeight={700} sx={{ mt: 0.5 }}>{stats?.isKioskMode ? 'AVS Election Officer' : 'Returning Officer'}</Typography>
            </Box>
            <Box sx={{ textAlign: 'center', width: 220 }}>
              <Divider className="print-border" sx={{ borderColor: 'rgba(255,255,255,0.2)', mb: 1, borderWidth: '1px' }} />
              <Typography variant="caption" className="print-text-mute" color="text.secondary" display="block">DATE OF ISSUANCE</Typography>
              <Typography variant="body2" className="print-text-dark" fontWeight={700} sx={{ mt: 0.5 }}>{new Date().toLocaleDateString()}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResultsPrint;
