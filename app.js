const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const MongoStore = require("connect-mongo")(session);
const cookieParser = require("cookie-parser");

// Config Passport
require("./config/passport")(passport);

// Routes
const projectRoutes = require("./api/routes/projects");
const supportRoutes = require("./api/routes/support");
const userRoutes = require("./api/routes/users");
const freelancerRoutes = require("./api/routes/freelancers");
const paymentRoutes = require("./api/routes/payments");

// App Middlewares
app.use('/public', express.static('static'))
app.use(morgan("dev"));
app.use(cors());

app.use((req, res, next) => {
  if (req.originalUrl === "/payment/webhook") {
    next();
  } else {
    bodyParser.json()(req, res, next);
    bodyParser.urlencoded({ extended: false });
  }
});

app.use(cookieParser());

// Express Session
app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60
    }),
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Route Middlewares
app.use("/api/project", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/freelancer", freelancerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/mysupport", supportRoutes);

// 404 Not Found
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Errors
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

// for local database
// mongoose.connect('mongodb://localhost:27017/database', {useNewUrlParser: true, useUnifiedTopology: true },()=>{
//   console.log("local database has been connected")
// });

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://yuvraj:peppershades2020@userdb-dfhek.mongodb.net/test?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    console.log("MongoDB is live on Atlas...");
  } catch (err) {
    console.error(err.message);
    console.log("Using local database");
    mongoose.connect("mongodb://localhost/peppershades", {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  }
};

connectDB();

module.exports = app;
