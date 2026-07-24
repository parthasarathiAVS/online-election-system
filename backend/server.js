const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const { Admin, Voter, Election, Candidate, Vote, AuditLog, CandidateVoteTotal } = require('./models');

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const voterRoutes = require('./routes/voterRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow serving images cross-origin
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    /\.netlify\.app$/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests, please try again later.'
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/voter', voterRoutes);

// Health Check
app.get('/health', (req, res) => res.json({ status: 'healthy', timestamp: new Date() }));

// Seed Database
const seedDatabase = async () => {
  try {
    const adminCount = await Admin.count();
    if (adminCount === 0) {
      const hash = await bcrypt.hash('Avscollege@6235', 12);
      await Admin.create({ Username: 'Avscollege', PasswordHash: hash, Email: 'admin@avscollege.ac.in', Role: 'superadmin' });
      console.log('Seeded default Admin: Avscollege / Avscollege@6235');
    } else {
      // Ensure existing admin account credentials are updated to Avscollege / Avscollege@6235
      const hash = await bcrypt.hash('Avscollege@6235', 12);
      await Admin.update(
        { Username: 'Avscollege', PasswordHash: hash },
        { where: {} }
      );
      console.log('Updated Admin credentials to: Avscollege / Avscollege@6235');
    }

    const voterCount = await Voter.count();
    if (voterCount === 0) {
      const hash = await bcrypt.hash('Password123!', 12);
      await Voter.bulkCreate([
        { VoterRegistrationNumber: 'VOTER001', FullName: 'Rajesh Kumar', PasswordHash: hash },
        { VoterRegistrationNumber: 'VOTER002', FullName: 'Priya Sharma', PasswordHash: hash },
        { VoterRegistrationNumber: 'VOTER003', FullName: 'Amit Patel', PasswordHash: hash }
      ]);
      console.log('Seeded demo Voters: VOTER001, VOTER002, VOTER003 / Password123!');
    }

    // Ensure all existing candidates have a CandidateVoteTotal record
    const candidates = await Candidate.findAll();
    for (const c of candidates) {
      const [totalRecord, created] = await CandidateVoteTotal.findOrCreate({
        where: { CandidateID: c.CandidateID },
        defaults: { ElectionID: c.ElectionID, VoteCount: 0 }
      });
      if (created) {
        const actualCount = await Vote.count({ where: { CandidateID: c.CandidateID } });
        if (actualCount > 0) {
          totalRecord.VoteCount = actualCount;
          await totalRecord.save();
          console.log(`Backfilled VoteCount ${actualCount} for Candidate ${c.FullName} (${c.CandidateID})`);
        }
      }
    }
  } catch (err) {
    console.error('Error seeding DB:', err);
  }
};

// Start Server
sequelize.authenticate()
  .then(() => {
    console.log('Connected to MySQL via Sequelize.');
    return sequelize.sync({ alter: true });
  })
  .then(async () => {
    await seedDatabase();
    app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
    console.log('Server continuing without DB connection for debugging.');
    app.listen(PORT, () => console.log(`Backend running (NO DB) on port ${PORT}`));
  });
