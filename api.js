var express = require('express');
var expressValidator = require('express-validator');
var mongoose = require('mongoose');
var connect = require('connect');
var passport = require('passport');
var SessionStore = require('session-mongoose')(connect);

var db = mongoose.connection;
db.on('error', function(error) {
  console.error('Error in MongoDB connection: ' + error);
  mongoose.disconnect();
});
db.on('connected', function() {
  console.log('Successfully connected to MongoDB');
});
db.on('connecting', function() {
  console.log('Connecting to MongoDB...');
});
db.on('reconnected', function() {
  console.log('Reconnected to MongoDB');
});
db.on('disconnected', function() {
  console.log('Disconnected from MongoDB');
  mongoose.connect(process.env.LIBRECMS_MONGO_URI, {server: {auto_reconnect: true} });
});
mongoose.connect(process.env.LIBRECMS_MONGO_URI, {server: {auto_reconnect: true} });

// Mongoose Schemata
require('./schemata');

// Passport authentication configuration
require('./auth');

var store = new SessionStore({
  url: process.env.LIBRECMS_MONGO_URI + '/session',
  sweeper: false
});

var app = express();
app.configure(function () {
  app.use(expressValidator());
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  // Session cookie expires in 1 week
  app.use(express.session({ 
    store: store,
    secret: 'ksajdfnaskdfjdn',
    cookie: { maxAge: 604800000 }
  }));
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
