import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import VoterDashboard from './pages/VoterDashboard';
import StudentDashboard from './pages/StudentDashboard';
import VotingBooth from './pages/VotingBooth';
import KioskMode from './pages/KioskMode';
import ResultsPrint from './pages/ResultsPrint';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/kiosk/:electionId" element={<ProtectedRoute role="admin"><KioskMode /></ProtectedRoute>} />
            <Route path="/admin/results/:electionId/print" element={<ProtectedRoute role="admin"><ResultsPrint /></ProtectedRoute>} />

            {/* Voter Routes */}
            <Route path="/voter" element={<ProtectedRoute role="voter"><VoterDashboard /></ProtectedRoute>} />
            
            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            
            {/* Shared Booth Route for Voter & Student roles */}
            <Route path="/voter/booth/:electionId" element={<ProtectedRoute role={['voter', 'student']}><VotingBooth /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
