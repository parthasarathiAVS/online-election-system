import React, { useState, useContext } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  Paper, InputAdornment, Link, Checkbox, FormControlLabel, Grid, IconButton
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const Register = () => {
  const { registerStudent } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    collegeName: '',
    department: '',
    year: '',
    registerNumber: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validateForm = () => {
    const validationErrors = [];
    const { fullName, collegeName, department, year, registerNumber, email, mobile, password, confirmPassword, termsAccepted } = formData;

    if (!fullName || fullName.trim().length < 2) {
      validationErrors.push('Full name must be at least 2 characters.');
    }
    if (!collegeName || collegeName.trim().length < 2) {
      validationErrors.push('College name is required.');
    }
    if (!department || department.trim().length < 2) {
      validationErrors.push('Department is required.');
    }
    if (!year) {
      validationErrors.push('Year of study is required.');
    }
    if (!registerNumber || registerNumber.trim().length < 3) {
      validationErrors.push('Register number must be at least 3 characters.');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('Please enter a valid email address.');
    }
    if (!mobile || !/^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''))) {
      validationErrors.push('Please enter a valid 10-digit Indian mobile number.');
    }
    if (!password || password.length < 8) {
      validationErrors.push('Password must be at least 8 characters.');
    }
    if (!/(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password)) {
      validationErrors.push('Password must contain at least one uppercase letter, one number, and one special character (!@#$%^&*).');
    }
    if (password !== confirmPassword) {
      validationErrors.push('Passwords do not match.');
    }
    if (!termsAccepted) {
      validationErrors.push('You must accept the Terms and Conditions to register.');
    }

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      if (profilePhoto) {
        data.append('profilePhoto', profilePhoto);
      }

      await registerStudent(data);
      setSuccess('Account created successfully! Redirecting to login page...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setErrors([err.response?.data?.message || 'Registration failed. Please try again.']);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 25%, #4338ca 50%, #6d28d9 75%, #7c3aed 100%)',
      position: 'relative',
      overflow: 'hidden',
      py: 6,
      px: 2.5
    }}>
      {/* Background Orbs */}
      <Box className="floating-shape-1" sx={{
        position: 'absolute', top: '2%', left: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
        filter: 'blur(45px)', pointerEvents: 'none'
      }} />
      <Box className="floating-shape-2" sx={{
        position: 'absolute', bottom: '2%', right: '5%',
        width: 350, height: 350, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
        filter: 'blur(45px)', pointerEvents: 'none'
      }} />

      {/* Glassmorphism Card */}
      <Paper className="slide-up" sx={{
        width: '100%',
        maxWidth: 700,
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
        {/* Top Accent Bar */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #818cf8, #a78bfa, #c084fc, #e879f9, #f472b6)' }} />

        <Box sx={{ p: { xs: 3, sm: 5 } }}>
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Typography variant="h4" fontWeight={800} sx={{
              background: 'linear-gradient(135deg, #ffffff, #c7d2fe)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: -0.5
            }}>
              Create Student Account
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(199,210,254,0.8)', mt: 0.5 }}>
              Register to participate in your campus digital democracy.
            </Typography>
          </Box>

          {errors.length > 0 && (
            <Alert severity="error" sx={{
              mb: 3, borderRadius: 3, fontWeight: 500,
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5',
              '& .MuiAlert-icon': { color: '#f87171' }
            }}>
              <Box>
                {errors.map((err, idx) => (
                  <Typography key={idx} variant="body2" sx={{ display: 'block' }}>{err}</Typography>
                ))}
              </Box>
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{
              mb: 3, borderRadius: 3, fontWeight: 500,
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              color: '#a7f3d0',
              '& .MuiAlert-icon': { color: '#34d399' }
            }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              {/* Full Name */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>FULL NAME</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="fullName"
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* College Name */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>COLLEGE NAME</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="collegeName"
                  placeholder="Enter college name"
                  value={formData.collegeName}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* Department */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>DEPARTMENT</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="department"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* Year */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>YEAR OF STUDY</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="year"
                  placeholder="e.g. 3rd Year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* Register Number */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>REGISTER NUMBER</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="registerNumber"
                  placeholder="Enter registration number"
                  value={formData.registerNumber}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* Email Address */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>EMAIL ADDRESS</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* Mobile Number */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>MOBILE NUMBER</Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* Photo Upload */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>PROFILE PHOTO (OPTIONAL)</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraOutlinedIcon />}
                    sx={{
                      height: 56,
                      borderRadius: '12px',
                      flexGrow: 1,
                      border: '2px dashed rgba(129,140,248,0.5)',
                      color: '#a5b4fc',
                      textTransform: 'none',
                      backgroundColor: 'rgba(99,102,241,0.08)',
                      '&:hover': {
                        border: '2px dashed #818cf8',
                        background: 'rgba(99,102,241,0.2)',
                      }
                    }}
                  >
                    Choose Image
                    <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
                  </Button>
                  {photoPreview && (
                    <Box
                      component="img"
                      src={photoPreview}
                      alt="Preview"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '12px',
                        objectFit: 'cover',
                        border: '2px solid rgba(129,140,248,0.5)'
                      }}
                    />
                  )}
                </Box>
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>PASSWORD</Typography>
                <TextField
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
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
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={labelStyle}>CONFIRM PASSWORD</Typography>
                <TextField
                  fullWidth
                  type={showConfirmPassword ? 'text' : 'password'}
                  variant="outlined"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: '#818cf8' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(p => !p)} edge="end" sx={{ color: 'rgba(199,210,254,0.6)' }}>
                          {showConfirmPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={inputStyle}
                />
              </Grid>

              {/* Terms Checkbox */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleInputChange}
                      sx={{
                        color: 'rgba(199,210,254,0.4)',
                        '&.Mui-checked': { color: '#818cf8' }
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: 'rgba(199,210,254,0.8)' }}>
                      I agree to the{' '}
                      <Link href="#" sx={{ color: '#a5b4fc', fontWeight: 600 }}>Terms and Conditions</Link>
                      {' '}for digital campus elections.
                    </Typography>
                  }
                />
              </Grid>
            </Grid>

            {/* Register Button */}
            <Box mt={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={submitting}
                sx={submitBtnStyle}
              >
                {submitting ? (
                  <Box display="flex" alignItems="center" gap={1}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Creating Account...</span>
                  </Box>
                ) : 'Register Account'}
              </Button>
            </Box>
          </form>

          {/* Already have an account? */}
          <Box textAlign="center" mt={3.5} pt={3} borderTop="1px solid rgba(255,255,255,0.08)">
            <Typography variant="body2" sx={{ color: 'rgba(199,210,254,0.6)' }}>
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" underline="hover" sx={{ color: '#a5b4fc', fontWeight: 700, ml: 0.5 }}>
                Login Here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

// ── Styles ────────────────────────────────────────────────────
const labelStyle = {
  fontWeight: 700,
  color: 'rgba(199,210,254,0.8)',
  letterSpacing: 0.8,
  mb: 1,
  display: 'block'
};

const inputStyle = {
  mb: 1,
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

const submitBtnStyle = {
  py: 1.6,
  fontSize: '1rem',
  fontWeight: 700,
  background: 'linear-gradient(135deg, #4f46e5, #6d28d9)',
  boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
  borderRadius: '14px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(99,102,241,0.55)',
    background: 'linear-gradient(135deg, #4f46e5, #6d28d9)'
  }
};

export default Register;
