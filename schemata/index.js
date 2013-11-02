var baucis = require('baucis');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10; // Salt passwords

var User = new mongoose.Schema({
  name: {
    first: String,
    last: String,
    user: {
      type: String,
      required: true,
      index: {
        unique: true
      }
    }
  },
  password: {
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
    bcrypt.hash(user.password, salt, function(err, hash) {
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
User.static('authenticate', function(username, password, next) {
  this.findOne({ "name.user": username }, function(err, user) {
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

mongoose.model('User', User);
baucis.rest('User');

var Course = new mongoose.Schema({
  name: {
  },
  password: {

  }
});
mongoose.model('Course', Course);
baucis.rest('Course');

var AssignmentSubmission = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('AssignmentSubmission', AssignmentSubmission);
baucis.rest('AssignmentSubmission');

var AssessmentSubmission = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('AssessmentSubmission', AssessmentSubmission);
baucis.rest('AssessmentSubmission');

var Content = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  }
});
mongoose.model('Content', Content);
baucis.rest('Content');


var Event = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
});
mongoose.model('Event', Event);
baucis.rest('Event');

var Section = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    index: {
      unique: true
    }
  },
  students: {
    type: [{
      id: {
        type: String,
        required: true
      },
      assignments: {
        type: [AssignmentSubmission],
        default: []
      },
      assessments: {
        type: [AssessmentSubmission],
        default: []
      }
    }],
    default: []
  },
  events: {
    type: [Event],
    default: []
  },
  content: {
    type: [Content],
    default: []
  }
});
mongoose.model('Section', Section);
baucis.rest('Section');
