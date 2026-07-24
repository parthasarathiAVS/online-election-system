const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterController');
const authenticate = require('../middleware/auth');
const voterOnly = require('../middleware/voterOnly');

router.use(authenticate, voterOnly);

router.get('/elections', voterController.getActiveElections);
router.get('/elections/:electionId', voterController.getElectionDetails);
router.post('/vote', voterController.castVote);

module.exports = router;
