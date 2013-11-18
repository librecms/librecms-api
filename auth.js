// Authentication-related methods
// Module Dependencies
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');

// Local Variables
var User = mongoose.model('User');


// Passport session setup
passport.serializeUser(function(user, next) {
  next(null, user._id);
});

passport.deserializeUser(function(id, next) {
  // @TODO what happend if id isn't a castable Mongo ObjectId type? 
  // Hint: it'll break
  User.findById(id, function(err, user) {
    next(err, user);
  });
});

// Passport Strategy methods
passport.use(new LocalStrategy(function(username, password, next) {
  process.nextTick(function() {
    User.authenticate(username, password, next);
  });
}));

module.exports.ensureAuthenticated = function(req, res, next) {
  console.log('ensureAuthenticated isAuthenticated = ' + req.isAuthenticated());
  console.log('ensureAuthenticated user = ' + JSON.stringify(req.user, null, 4));
  if (req.isAuthenticated()) { return next(); }
  res.status(401).end();
};

module.exports.ensureInstructor = function(req, res, next) {
  console.log('ensureInstructor req.user = ' + JSON.stringify(req.user, null, 4));
  if (!req.isAuthenticated() || !req.user || !req.user.role ||
      req.user.role !== 'instructor') {
    return res.status(403).end();
  }
  return next();
};

module.exports.ensureStudent = function(req, res, next) {
  if (!req.isAuthenticated() || !req.user || !req.user.role ||
      req.user.role !== 'student') {
    return res.status(401).end();
  }
  return next();
};
