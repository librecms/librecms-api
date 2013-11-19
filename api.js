var express = require('express');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var connect = require('connect');
var passport = require('passport');

mongoose.connect(process.env.LIBRECMS_MONGO_URI);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log('Successfully connected to database');
});

// Mongoose Schemata
require('./schemata');

// Passport authentication configuration
require('./auth');

var app = express();
app.configure(function () {
  app.use(expressValidator());
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

// API Routes definitions
var routes = require('./routes');
routes.init(app);

// Start the application
var port = process.env.LIBRECMS_API_PORT || process.env.PORT || 3030;
app.listen(port);
console.log('API started on port ' + port);
