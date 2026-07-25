const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');

const {
  Admin,
  Voter,
  Candidate,
  Vote,
  CandidateVoteTotal
} = require('./models');


const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const voterRoutes = require('./routes/voterRoutes');


const app = express();

const PORT = process.env.PORT || 5000;


// ================= SECURITY =================

app.use(helmet());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://online-election-system-gblrimh0f-online-election.vercel.app",
      /\.vercel\.app$/
    ],
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS"
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization"
    ]
  })
);


// Handle preflight
app.options("*", cors());


app.use(express.json());

app.use(morgan("dev"));



// ================= STATIC FILE =================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      process.env.UPLOAD_DIR || "uploads"
    )
  )
);



// ================= RATE LIMIT =================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});


app.use("/api", limiter);



// ================= ROUTES =================


app.get("/", (req, res) => {
  res.json({
    message: "VoteSecure Backend API Running"
  });
});


app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/admin",
  adminRoutes
);


app.use(
  "/api/voter",
  voterRoutes
);



app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    time: new Date()
  });
});




// ================= DATABASE SEED =================


const seedDatabase = async () => {

  try {


    const adminCount = await Admin.count();


    if (adminCount === 0) {

      const hash = await bcrypt.hash(
        "Avscollege@6235",
        12
      );


      await Admin.create({

        Username: "Avscollege",

        PasswordHash: hash,

        Email: "admin@avscollege.ac.in",

        Role: "superadmin"

      });


      console.log(
        "Admin created : Avscollege / Avscollege@6235"
      );


    }



    const voterCount = await Voter.count();


    if (voterCount === 0) {


      const hash = await bcrypt.hash(
        "Password123!",
        12
      );



      await Voter.bulkCreate([

        {
          VoterRegistrationNumber: "VOTER001",
          FullName: "Rajesh Kumar",
          PasswordHash: hash
        },

        {
          VoterRegistrationNumber: "VOTER002",
          FullName: "Priya Sharma",
          PasswordHash: hash
        },

        {
          VoterRegistrationNumber: "VOTER003",
          FullName: "Amit Patel",
          PasswordHash: hash
        }

      ]);


      console.log(
        "Demo voters created"
      );


    }



    const candidates = await Candidate.findAll();


    for (const c of candidates) {


      await CandidateVoteTotal.findOrCreate({

        where: {
          CandidateID: c.CandidateID
        },

        defaults: {
          ElectionID: c.ElectionID,
          VoteCount: 0
        }

      });


    }



  }
  catch (err) {

    console.log(
      "Seed error:",
      err.message
    );

  }


};




// ================= START SERVER =================


const startServer = async () => {


  try {


    await sequelize.authenticate();

    console.log(
      "Connected to MySQL via Sequelize."
    );



    await sequelize.sync({
      alter: true
    });


    await seedDatabase();



    app.listen(
      PORT,
      () => {
        console.log(
          `Backend running on port ${PORT}`
        );
      }
    );


  }
  catch (err) {


    console.error(
      "Database connection failed:",
      err.message
    );


    app.listen(
      PORT,
      () => {
        console.log(
          `Backend running WITHOUT DB on port ${PORT}`
        );
      }
    );


  }


};



startServer();