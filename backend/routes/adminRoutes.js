const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticate = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const upload = require('../middleware/upload');

router.use(authenticate, adminOnly);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Elections
router.post('/elections', adminController.createElection);
router.get('/elections', adminController.getElections);
router.put('/elections/:id', adminController.updateElection);
router.post('/elections/:id/archive', adminController.archiveElection);
router.post('/elections/:id/reset', adminController.resetElection);
router.delete('/elections/:id', adminController.deleteElection);

// Candidates
router.post('/candidates', upload.single('photo'), adminController.addCandidate);
router.get('/candidates', adminController.getCandidates);
router.put('/candidates/:id', upload.single('photo'), adminController.updateCandidate);
router.delete('/candidates/:id', adminController.deleteCandidate);

// Voters
router.post('/voters', adminController.registerVoter);
router.get('/voters', adminController.getVoters);
router.put('/voters/:id/status', adminController.toggleVoterStatus);

// Kiosk Mode Voting
router.post('/kiosk/verify-student', adminController.verifyStudentForKiosk);
router.post('/kiosk/vote', adminController.kioskCastVote);

// Results & Logs
router.get('/results/:electionId', adminController.getElectionResults);
router.get('/export/:electionId/excel', adminController.exportExcel);
router.get('/logs', adminController.getAuditLogs);

module.exports = router;
