const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const path = require("path");
const MongoStore = require("connect-mongo")(session);
const cookieParser = require("cookie-parser");
const flash = require('connect-flash')
const supportauth = require('./scripts/supportauth')
const login = require('./scripts/supportlogin')
const {updates} = require('./scripts/updatefreelancers')

// Config Passport
require("./config/passport")(passport);

// Routes
const projectRoutes = require("./api/routes/projects");
const supportRoutes = require("./api/routes/support");
const userRoutes = require("./api/routes/users");
const freelancerRoutes = require("./api/routes/freelancers");
const paymentRoutes = require("./api/routes/payments");

app.set('views', path.join(__dirname, 'support'));
app.set('view engine', 'ejs');


// App Middlewares
app.use('/', express.static('dist'))
app.use('/public', express.static('static'))
app.use(morgan("dev"));
app.use(cors());

const useBodyParser = (req, res, next) => {
  bodyParser.json()
  bodyParser.urlencoded({extended: false})
  next()
}


app.use(bodyParser())
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
      maxAge: 365 * 24 * 60 * 60 * 1000
    }
  })
);

app.use(flash())

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//for login
app.post('/api/support/login',useBodyParser, login)
// Route Middlewares
app.use("/api/project", projectRoutes);
app.use("/api/user", userRoutes);
app.use("/api/freelancer", freelancerRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/support", useBodyParser, supportauth, supportRoutes);


// // 404 Not Found
// app.use((req, res, next) => {
//   const error = new Error("Not Found");
//   error.status = 404;
//   // res.redirect("https://www.peppershades.com/#/notfound")
// });

// Errors
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});


const updateDetails = () => {
  setInterval(() => {
    let d = new Date
    let hour = d.getHours()
    if(hour === 0){
      updates();
    }
  }, 3600000)
  console.log('Freelancers details will be updated between 12AM - 1AM everyday')
}

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
updateDetails();

module.exports = app;
