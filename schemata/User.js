var SALT_WORK_FACTOR = 10; // Salt passwords
var bcrypt = require('bcrypt-nodejs');
var mongoose = require('mongoose');

var User = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  }
});

// We don't want to save plaintext passwords,
// so we salt + hash them here
User.pre('save', function(next) {
  var user = this;
  // Rehash password if it has been modified
  if (!user.isModified('password')) return next();

  
  // Generate a random salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // Hash password+salt
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      // Overwrite password with password+salt hash
      user.password = hash;
      next();
    });
  });
});

// Compare salt + hashed password with plaintext password
User.methods.comparePassword = function(candidate, next) {
  bcrypt.compare(candidate, this.password, function(err, isMatch) {
    if (err) return next(err);
    next(null, isMatch);
  });
};

// Common task, so we implement it here for DRYness
User.static('authenticate', function(userName, password, next) {
  this.findOne({ userName: userName }, function(err, user) {
    if (err) return next(err);
    if (!user) return next(null, false);
    user.comparePassword(password, function(err, isCorrectPassword) {
      if (err) return next(err);
      if (isCorrectPassword) { 
        return next(null, user);
      } else {
        return next(null, false);
      }
    });
  });
});

// There's probably a better way to do this.
User.methods.getCourses = function(next) {
  var Course = mongoose.model('Course');

  var query = { 
    $or: [
      { students: this._id },
      { instructors: this._id }
    ]
  };
  var filter = { name: true };
  Course.find(query, filter, function(err, courses) {
    next(err, courses);
  });

};

mongoose.model('User', User);

module.exports = User;
