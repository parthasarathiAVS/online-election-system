import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Grid, Card, CardContent, CircularProgress,
  Alert, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Tooltip, Avatar, Divider, Tab, Tabs,
  LinearProgress, Snackbar
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DownloadIcon from '@mui/icons-material/Download';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PrintIcon from '@mui/icons-material/Print';
import PeopleIcon from '@mui/icons-material/People';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';

// ── Stat Card ──────────────────────────────────
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{
    background: '#FFFFFF',
    border: `1px solid #CCFBF1`,
    borderTop: `4px solid ${color}`,
    borderRadius: '16px',
    boxShadow: '0 10px 30px -5px rgba(15,118,110,0.06)'
  }}>
    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2.5 }}>
      <Box>
        <Typography variant="overline" color="#475569" sx={{ letterSpacing: 1.5, fontSize: '.65rem', fontWeight: 700 }}>{title}</Typography>
        <Typography variant="h3" fontWeight={800} color={color} sx={{ lineHeight: 1.2, mt: .5 }}>{value ?? '—'}</Typography>
      </Box>
      {React.cloneElement(icon, { sx: { fontSize: 52, color: `${color}22` } })}
    </CardContent>
  </Card>
);

// ── Candidate Dialog ───────────────────────────
const PARTY_COLORS = ['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#14b8a6','#f97316'];

const CandidateDialog = ({ open, onClose, onSave, electionId, editData }) => {
  const [form, setForm] = useState({ fullName: '', party: '', symbol: '', color: '#3b82f6', manifesto: '' });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (editData) {
      setForm({
        fullName: editData.FullName || '',
        party: editData.Party || '',
        symbol: editData.Symbol || '',
        color: editData.Color || '#3b82f6',
        manifesto: editData.Manifesto || ''
      });
      setPhotoPreview(editData.PhotoURL ? editData.PhotoURL : '');
    } else {
      setForm({ fullName: '', party: '', symbol: '', color: '#3b82f6', manifesto: '' });
      setPhotoPreview('');
      setPhoto(null);
    }
    setError('');
  }, [editData, open]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.fullName.trim() || !form.party.trim()) {
      setError('Candidate name and party are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('electionId', electionId);
      fd.append('fullName', form.fullName);
      fd.append('party', form.party);
      fd.append('symbol', form.symbol);
      fd.append('color', form.color);
      fd.append('manifesto', form.manifesto);
      if (photo) fd.append('photo', photo);

      if (editData) {
        await api.put(`/admin/candidates/${editData.CandidateID}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/admin/candidates', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save candidate.');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { background: '#FFFFFF', border: '1px solid #CCFBF1', borderRadius: '20px', overflow: 'hidden' }
    }}>
      <Box sx={{ height: 5, background: 'linear-gradient(90deg, #0F766E 0%, #06B6D4 50%, #4338CA 100%)' }} />
      <DialogTitle sx={{ borderBottom: '1px solid #CCFBF1', pb: 2 }}>
        <Typography variant="h5" fontWeight={800} color="#134E4A">{editData ? 'Edit Candidate' : 'Enrol New Candidate'}</Typography>
        <Typography variant="caption" color="#475569">Fill in the details and upload a candidate photo</Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* Photo Upload — Prominent */}
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Box sx={{ position: 'relative', mb: 1 }}>
            <Avatar
              src={photoPreview}
              sx={{
                width: 120,
                height: 120,
                fontSize: '3.5rem',
                border: `3px solid ${form.color}`,
                background: photoPreview ? 'transparent' : `${form.color}22`,
                boxShadow: `0 8px 24px ${form.color}44`
              }}
            >
              {!photoPreview && form.symbol}
            </Avatar>
            <IconButton
              onClick={() => fileRef.current.click()}
              size="small"
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                background: '#0F766E',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(15,118,110,0.4)',
                '&:hover': { background: '#115E59' }
              }}
            >
              <PhotoCameraIcon fontSize="small" />
            </IconButton>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
          </Box>
          <Typography variant="caption" color="#475569" fontWeight={600}>
            {photoPreview ? '✓ Photo uploaded — click camera to change' : 'Click the camera icon to upload a candidate photo'}
          </Typography>
          {!photoPreview && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => fileRef.current.click()}
              sx={{ mt: 1, borderColor: '#0F766E', color: '#0F766E', borderRadius: 2, fontSize: '0.75rem' }}
              startIcon={<PhotoCameraIcon fontSize="small" />}
            >
              Upload Photo
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Full Name" variant="outlined" required
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="e.g. Arjun Kumar"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Party / Department" variant="outlined" required
              value={form.party}
              onChange={e => setForm(f => ({ ...f, party: e.target.value }))}
              placeholder="e.g. Student Council / CSE Dept."
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Bio / Manifesto" variant="outlined" multiline rows={2}
              value={form.manifesto}
              onChange={e => setForm(f => ({ ...f, manifesto: e.target.value }))}
              placeholder="Short description or campaign promises..."
            />
          </Grid>

          {/* Custom Symbol Input */}
          <Grid item xs={12}>
            <Typography variant="caption" color="#134E4A" sx={{ mb: 1, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
              ELECTION SYMBOL
            </Typography>
            <TextField
              fullWidth
              variant="outlined"
              value={form.symbol}
              onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
              placeholder="e.g. 🌸 or type a symbol name like 'Lotus', 'Star'"
              helperText="Enter an emoji or text symbol for this candidate's ballot identifier"
              InputProps={{
                startAdornment: form.symbol ? (
                  <Box sx={{ mr: 1, fontSize: '1.5rem', lineHeight: 1 }}>{form.symbol}</Box>
                ) : null
              }}
            />
          </Grid>

          {/* Color Picker */}
          <Grid item xs={12}>
            <Typography variant="caption" color="#134E4A" sx={{ mb: 1, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
              PARTY COLOR
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              {PARTY_COLORS.map(c => (
                <Box key={c} onClick={() => setForm(f => ({ ...f, color: c }))} sx={{
                  width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: `3px solid ${form.color === c ? '#134E4A' : 'transparent'}`,
                  boxShadow: form.color === c ? `0 0 0 2px ${c}` : 'none',
                  transition: 'all .15s'
                }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, borderTop: '1px solid #CCFBF1', pt: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderColor: '#CBD5E1', color: '#475569' }}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={saving}
          sx={{ backgroundColor: '#0F766E', '&:hover': { backgroundColor: '#115E59' } }}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}>
          {saving ? 'Saving...' : (editData ? 'Update Candidate' : 'Enrol Candidate')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ── Create Election Dialog ─────────────────────
const CreateElectionDialog = ({ open, onClose, onCreated }) => {
  const [form, setForm] = useState({ title: '', description: '', isKioskMode: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!form.title) {
      setError('Title is required.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/admin/elections', form);
      onCreated();
      onClose();
      setForm({ title: '', description: '', isKioskMode: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create election.');
    }
    setSaving(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{
      sx: { background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px' }
    }}>
      <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', pb: 2 }}>
        <Typography variant="h5" fontWeight={800}>Create New Election</Typography>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField fullWidth label="Election Title" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Municipal Corporation Election 2024" />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Description" multiline rows={2} value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,153,51,0.3)', background: 'rgba(255,153,51,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography fontWeight={700} color="primary">AVS Mode (EVM)</Typography>
                <Typography variant="caption" color="text.secondary">Admin controls the machine. No voter login needed.</Typography>
              </Box>
              <Chip label={form.isKioskMode ? 'ENABLED' : 'DISABLED'}
                color={form.isKioskMode ? 'primary' : 'default'}
                onClick={() => setForm(f => ({ ...f, isKioskMode: !f.isKioskMode }))}
                sx={{ cursor: 'pointer', fontWeight: 700 }} />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
        <Button onClick={handleCreate} variant="contained" color="primary" disabled={saving}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <AddCircleIcon />}>
          {saving ? 'Creating...' : 'Create Election'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ══════════════════════════════════════════════
//  MAIN ADMIN DASHBOARD
// ══════════════════════════════════════════════
const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [activeElection, setActiveElection] = useState(null);
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [snack, setSnack] = useState('');

  // Dialogs
  const [showCreateElection, setShowCreateElection] = useState(false);
  const [showCandidateDialog, setShowCandidateDialog] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);

  useEffect(() => { fetchElections(); }, []);

  useEffect(() => {
    if (!activeElection || activeElection.Status !== 'Live') return;
    const interval = setInterval(async () => {
      try {
        const [statsRes, resultsRes] = await Promise.all([
          api.get(`/admin/dashboard?electionId=${activeElection.ElectionID}`),
          api.get(`/admin/results/${activeElection.ElectionID}`)
        ]);
        setStats(statsRes.data);
        setResults(resultsRes.data?.results || null);
      } catch (err) {
        console.error('Real-time poll error:', err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [activeElection]);

  const fetchElections = async () => {
    try {
      const res = await api.get('/admin/elections');
      setElections(res.data);
      if (res.data.length > 0) {
        await loadElectionData(res.data[0]);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError('Error fetching elections');
      setLoading(false);
    }
  };

  const loadElectionData = async (elec) => {
    setLoading(true);
    setActiveElection(elec);
    setCandidates([]);
    setResults(null);
    setStats(null);
    try {
      const [statsRes, candsRes] = await Promise.all([
        api.get(`/admin/dashboard?electionId=${elec.ElectionID}`),
        api.get(`/admin/candidates?electionId=${elec.ElectionID}`)
      ]);
      setStats(statsRes.data);
      setCandidates(candsRes.data);

      if (elec.Status === 'Live' || elec.Status === 'Ended' || elec.Status === 'Archived') {
        const resultsRes = await api.get(`/admin/results/${elec.ElectionID}`);
        setResults(resultsRes.data?.results || null);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeleteCandidate = async (c) => {
    if (!window.confirm(`Delete candidate "${c.FullName}"?`)) return;
    try {
      await api.delete(`/admin/candidates/${c.CandidateID}`);
      setSnack(`"${c.FullName}" removed.`);
      refreshCandidates();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting candidate.');
    }
  };

  const refreshCandidates = async () => {
    if (!activeElection) return;
    const res = await api.get(`/admin/candidates?electionId=${activeElection.ElectionID}`);
    setCandidates(res.data);
    setSnack('Candidate list updated!');
  };

  const handleDeleteElection = async () => {
    if (!window.confirm(`Are you SURE you want to delete "${activeElection.Title}"? This will permanently delete all candidates and votes associated with it.`)) return;
    try {
      await api.delete(`/admin/elections/${activeElection.ElectionID}`);
      setSnack(`Election deleted.`);
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting election.');
    }
  };

  const handleStartElection = async () => {
    if (!window.confirm(`Start this election right now? This will instantly open it up for voting.`)) return;
    try {
      await api.put(`/admin/elections/${activeElection.ElectionID}`, { status: 'Live' });
      setSnack(`Election is now LIVE!`);
      fetchElections();
      
      if (activeElection.IsKioskMode) {
        navigate(`/admin/kiosk/${activeElection.ElectionID}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error starting election.');
    }
  };

  const handleEndElection = async () => {
    if (!window.confirm(`End this election? Voting will be permanently closed and results will be generated.`)) return;
    try {
      await api.put(`/admin/elections/${activeElection.ElectionID}`, { status: 'Ended' });
      setSnack(`Election has ENDED!`);
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || 'Error ending election.');
    }
  };

  const startKiosk = () => navigate(`/admin/kiosk/${activeElection.ElectionID}`);

  const handleDownloadExcel = async () => {
    try {
      const res = await api.get(`/admin/export/${activeElection.ElectionID}/excel`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `results_${activeElection.Title}.xlsx`);
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
    } catch { alert("Failed to download Excel."); }
  };

  const getStatusColor = (status) => {
    const map = { Live: '#10B981', Upcoming: '#F59E0B', Ended: '#EF4444', Closed: '#EF4444', Draft: '#4338CA', Archived: '#6B7280' };
    return map[status] || '#0F766E';
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F0FDFA' }}>

      {/* Navbar */}
      <Box sx={{ px: 4, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#FFFFFF', borderBottom: '3px solid #0F766E', boxShadow: '0 4px 20px rgba(15,118,110,0.06)' }}>
        <Box display="flex" alignItems="center" gap={2}>
          <img src="/logo.png" alt="VoteVerse AI" style={{ height: 48, objectFit: 'contain' }} />
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ background: 'linear-gradient(135deg,#0F766E,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
              VoteVerse AI
            </Typography>
            <Typography variant="caption" color="#475569" sx={{ letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>
              Campus Election Officer: {user?.username}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={2}>
          <Button variant="contained" sx={{ backgroundColor: '#0F766E', '&:hover': { backgroundColor: '#115E59' } }} startIcon={<AddCircleIcon />}
            onClick={() => setShowCreateElection(true)}>
            New Election
          </Button>
          <Button variant="outlined" color="inherit" onClick={logout} startIcon={<LogoutIcon />} sx={{ borderColor: '#CBD5E1' }}>Logout</Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mx: 4, mt: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* ── Sidebar ── */}
        <Box sx={{ width: 280, minHeight: '100%', p: 2.5, background: '#134E4A', color: '#FFFFFF', borderRight: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>
          <Typography variant="overline" sx={{ px: 1, display: 'block', mb: 1.5, fontWeight: 700, letterSpacing: 1.5, color: '#99F6E4' }}>
            Elections
          </Typography>
          {elections.map(e => (
            <Box key={e.ElectionID} onClick={() => loadElectionData(e)} sx={{
              p: 2, mb: 1.5, borderRadius: 3, cursor: 'pointer', transition: 'all .25s',
              background: activeElection?.ElectionID === e.ElectionID ? '#0F766E' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeElection?.ElectionID === e.ElectionID ? '#2DD4BF' : 'rgba(255,255,255,0.1)'}`,
              boxShadow: activeElection?.ElectionID === e.ElectionID ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
              '&:hover': { background: activeElection?.ElectionID === e.ElectionID ? '#0F766E' : 'rgba(255,255,255,0.1)' }
            }}>
              <Typography fontWeight={700} noWrap sx={{ fontSize: '.9rem', color: '#FFFFFF' }}>{e.Title}</Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip size="small" label={e.Status} sx={{ background: `${getStatusColor(e.Status)}33`, color: getStatusColor(e.Status) === '#10B981' ? '#34D399' : getStatusColor(e.Status), fontWeight: 700, fontSize: '.65rem' }} />
                {e.IsKioskMode && <Chip size="small" label="AVS" variant="outlined" color="warning" sx={{ fontSize: '.65rem', borderColor: '#F59E0B', color: '#FCD34D' }} />}
              </Box>
            </Box>
          ))}
          {elections.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>No elections yet. Create one!</Typography>
          )}
        </Box>

        {/* ── Main Content ── */}
        <Box sx={{ flex: 1, p: 4, overflowY: 'auto' }}>
          {loading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={10} gap={2}>
              <CircularProgress color="primary" />
              <Typography color="text.secondary">Loading election data...</Typography>
            </Box>
          ) : !activeElection ? (
            <Box textAlign="center" py={12}>
              <HowToVoteIcon sx={{ fontSize: 80, color: 'text.secondary', opacity: 0.3, mb: 3 }} />
              <Typography variant="h5" color="text.secondary">No elections found</Typography>
              <Button variant="contained" color="primary" sx={{ mt: 3 }} startIcon={<AddCircleIcon />}
                onClick={() => setShowCreateElection(true)}>
                Create Your First Election
              </Button>
            </Box>
          ) : (
            <Box className="fade-in">
              {/* Election Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                  <Box display="flex" alignItems="center" gap={2} mb={1}>
                    <Chip label={activeElection.Status} sx={{ background: `${getStatusColor(activeElection.Status)}22`, color: getStatusColor(activeElection.Status), fontWeight: 800 }} />
                    {activeElection.IsKioskMode && <Chip label="AVS MODE" color="warning" size="small" sx={{ fontWeight: 700 }} />}
                  </Box>
                  <Typography variant="h3" fontWeight={900}>{activeElection.Title}</Typography>
                </Box>
                <Box display="flex" gap={2}>
                  {activeElection.Status === 'Upcoming' && (
                    <Button variant="contained" color="success" onClick={handleStartElection} startIcon={<PlayArrowIcon />} sx={{ py: 1.5, px: 3, fontWeight: 800 }}>
                      START ELECTION NOW
                    </Button>
                  )}
                  {activeElection.Status === 'Live' && (
                    <Button variant="contained" color="error" onClick={handleEndElection} startIcon={<AssessmentIcon />} sx={{ py: 1.5, px: 3, fontWeight: 800 }}>
                      END ELECTION
                    </Button>
                  )}
                  {activeElection.IsKioskMode && activeElection.Status === 'Live' && (
                    <Button variant="contained" color="primary" size="large" onClick={startKiosk}
                      startIcon={<PlayArrowIcon />} sx={{ py: 1.5, px: 4, fontWeight: 800, fontSize: '1rem' }}>
                      START AVS TERMINAL
                    </Button>
                  )}
                  <Tooltip title="Delete Election">
                    <Button variant="outlined" color="error" onClick={handleDeleteElection} sx={{ py: 1.5 }} startIcon={<DeleteIcon />}>
                      Delete
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              {/* Stats */}
              <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={4}>
                  <StatCard title="CANDIDATES" value={candidates.length} icon={<PersonIcon />} color="#3b82f6" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StatCard title="VOTES CAST" value={stats?.votesCast} icon={<MonitorHeartIcon />} color="#10b981" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <StatCard title="TURNOUT" value={`${stats?.turnoutPercentage ?? 0}%`} icon={<AssessmentIcon />} color="#FF9933" />
                </Grid>
              </Grid>

              {/* Turnout Bar */}
              {stats?.totalVoters > 0 && (
                <Box mb={4} sx={{ p: 2, borderRadius: 2, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Voter Turnout Progress</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary">{stats.votesCast} / {stats.totalVoters}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={stats.turnoutPercentage} color="primary" sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              )}

              {/* Tabs: Candidates / Results */}
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <Tab label={`Candidates (${candidates.length})`} icon={<PersonIcon fontSize="small" />} iconPosition="start" />
                {(activeElection.Status === 'Live' || activeElection.Status === 'Ended' || activeElection.Status === 'Archived') && (
                  <Tab label={activeElection.Status === 'Live' ? "Live Standings" : "Final Results"} icon={<AssessmentIcon fontSize="small" />} iconPosition="start" />
                )}
              </Tabs>

              {/* ── CANDIDATES TAB ── */}
              {activeTab === 0 && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700}>Registered Candidates</Typography>
                    <Button variant="contained" color="primary" startIcon={<AddIcon />}
                      onClick={() => { setEditCandidate(null); setShowCandidateDialog(true); }}>
                      Add Candidate
                    </Button>
                  </Box>

                  {candidates.length === 0 ? (
                    <Box textAlign="center" py={8} sx={{ border: '2px dashed #CCFBF1', borderRadius: 3, background: '#F0FDFA' }}>
                      <PersonIcon sx={{ fontSize: 60, color: '#99F6E4', mb: 2 }} />
                      <Typography color="#134E4A" variant="h6" fontWeight={700}>No candidates enrolled yet</Typography>
                      <Typography color="#475569" variant="body2" mb={3}>Add candidates to register them for this election</Typography>
                      <Button variant="contained" sx={{ backgroundColor: '#0F766E', '&:hover': { backgroundColor: '#115E59' } }} startIcon={<AddIcon />}
                        onClick={() => { setEditCandidate(null); setShowCandidateDialog(true); }}>
                        Enrol First Candidate
                      </Button>
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {candidates.map((c, i) => (
                        <Grid item xs={12} sm={6} md={4} key={c.CandidateID}>
                          <Card sx={{
                            background: '#FFFFFF',
                            border: `1px solid #CCFBF1`,
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 30px -5px rgba(15,118,110,0.06)',
                            transition: 'all 0.25s ease',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 20px 40px -5px rgba(15,118,110,0.12)', borderColor: '#0F766E' }
                          }}>
                            {/* Candidate Photo Banner */}
                            <Box sx={{ position: 'relative', height: 160, background: `linear-gradient(135deg, ${c.Color || '#0F766E'}18, ${c.Color || '#06B6D4'}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: `3px solid ${c.Color || '#0F766E'}` }}>
                              {c.PhotoURL ? (
                                <Box
                                  component="img"
                                  src={c.PhotoURL}
                                  alt={c.FullName}
                                  sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                                />
                              ) : (
                                <Box sx={{ textAlign: 'center' }}>
                                  <Box sx={{ fontSize: '3.5rem', mb: 0.5 }}>{c.Symbol}</Box>
                                  <Typography variant="caption" color="#94A3B8" fontWeight={600}>No photo uploaded</Typography>
                                </Box>
                              )}
                              {/* Candidate Number Badge */}
                              <Box sx={{
                                position: 'absolute', top: 10, left: 10,
                                width: 28, height: 28, borderRadius: '8px',
                                background: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '.8rem', fontWeight: 900, color: c.Color || '#0F766E'
                              }}>
                                #{i + 1}
                              </Box>
                              {/* Color dot / party indicator */}
                              <Box sx={{
                                position: 'absolute', top: 10, right: 10,
                                px: 1.5, py: 0.4, borderRadius: '20px',
                                background: 'rgba(255,255,255,0.9)',
                                display: 'flex', alignItems: 'center', gap: 0.5
                              }}>
                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', background: c.Color || '#0F766E' }} />
                                <Typography variant="caption" fontWeight={700} color={c.Color || '#0F766E'} sx={{ fontSize: '.65rem' }}>
                                  {c.Symbol}
                                </Typography>
                              </Box>
                            </Box>

                            <CardContent sx={{ pt: 2, pb: 1 }}>
                              <Typography fontWeight={800} color="#134E4A" noWrap sx={{ fontSize: '1rem', mb: 0.3 }}>{c.FullName}</Typography>
                              <Typography variant="body2" fontWeight={600} color={c.Color || '#0F766E'} mb={1}>{c.Party}</Typography>
                              {c.Manifesto && (
                                <Typography variant="caption" color="#475569" sx={{ display: '-webkit-box', mb: 1.5, fontStyle: 'italic', lineHeight: 1.4,
                                  overflow: 'hidden', textOverflow: 'ellipsis', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                  "{c.Manifesto}"
                                </Typography>
                              )}
                              <Divider sx={{ borderColor: '#CCFBF1', mb: 1.5 }} />
                              <Box display="flex" gap={1}>
                                <Tooltip title="Edit Candidate">
                                  <Button size="small" variant="outlined"
                                    sx={{ flex: 1, borderColor: '#0F766E', color: '#0F766E', '&:hover': { background: 'rgba(15,118,110,0.06)' } }}
                                    startIcon={<EditIcon />}
                                    onClick={() => { setEditCandidate(c); setShowCandidateDialog(true); }}>
                                    Edit
                                  </Button>
                                </Tooltip>
                                <Tooltip title="Delete Candidate">
                                  <IconButton size="small" color="error" onClick={() => handleDeleteCandidate(c)}
                                    sx={{ border: '1px solid rgba(239,68,68,0.25)', '&:hover': { background: 'rgba(239,68,68,0.08)' } }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {/* ── RESULTS TAB ── */}
              {activeTab === 1 && results && (
                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight={700}>Election Results — {activeElection.Title}</Typography>
                    <Box display="flex" gap={2}>
                      <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={handleDownloadExcel}>
                        Export Excel
                      </Button>
                      <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={() => window.open(`/admin/results/${activeElection.ElectionID}/print`, '_blank')}>
                        Print Certificate
                      </Button>
                    </Box>
                  </Box>

                  {activeElection.Status === 'Live' && (
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      background: '#ECFDF5',
                      border: '1px solid #10B981',
                      borderRadius: '12px',
                      p: 2,
                      mb: 3,
                      color: '#065F46'
                    }}>
                      <Box sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#10B981',
                        animation: 'pulse 1.5s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
                          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 6px rgba(16, 185, 129, 0)' },
                          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }
                        }
                      }} />
                      <Typography variant="body2" fontWeight={600}>
                        ⚡ Live Update Active: Election is currently Live. The Excel sheet updates instantly on each new vote cast.
                      </Typography>
                    </Box>
                  )}
                  {results.map((r, i) => {
                    const pct = stats?.votesCast > 0 ? ((r.VoteCount / stats.votesCast) * 100).toFixed(1) : 0;
                    return (
                      <Box key={r.CandidateID} sx={{
                        display: 'flex', alignItems: 'center', gap: 3, p: 2.5, mb: 2,
                        background: i === 0 ? 'rgba(15,118,110,0.06)' : '#FFFFFF',
                        border: `1px solid ${i === 0 ? '#0F766E' : '#CCFBF1'}`,
                        borderLeft: `4px solid ${i === 0 ? '#0F766E' : '#94A3B8'}`,
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(15,118,110,0.04)'
                      }}>
                        <Typography variant="h4" fontWeight={900} sx={{ width: 40, color: i === 0 ? '#0F766E' : 'text.secondary' }}>#{i+1}</Typography>
                        <Avatar sx={{ width: 52, height: 52, fontSize: '1.5rem', background: `${r.Color}22`, border: `2px solid ${r.Color}` }}>
                          {r.Symbol}
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="h6" fontWeight={700}>{r.FullName}</Typography>
                          <Typography variant="body2" color="#475569">{r.Party}</Typography>
                          <LinearProgress variant="determinate" value={pct} sx={{ mt: 1, height: 6, borderRadius: 3,
                            '& .MuiLinearProgress-bar': { background: i === 0 ? 'linear-gradient(90deg, #0F766E, #06B6D4)' : '#06B6D4' } }} />
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="h4" fontWeight={900}>{r.VoteCount}</Typography>
                          <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                        </Box>
                        {i === 0 && <Chip label="🏆 WINNER" color="primary" sx={{ fontWeight: 900 }} />}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs */}
      <CreateElectionDialog
        open={showCreateElection}
        onClose={() => setShowCreateElection(false)}
        onCreated={fetchElections}
      />
      <CandidateDialog
        open={showCandidateDialog}
        onClose={() => { setShowCandidateDialog(false); setEditCandidate(null); }}
        onSave={refreshCandidates}
        electionId={activeElection?.ElectionID}
        editData={editCandidate}
      />

      {/* Snackbar */}
      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')}
        message={snack} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} />
    </Box>
  );
};

export default AdminDashboard;
