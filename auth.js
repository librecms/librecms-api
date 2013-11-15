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
