var mongoose = require('mongoose');
var User = mongoose.model('User');
var Course = mongoose.model('Course');

var UserCtrl = {
  init: function(app) {
    app.post('/users', function(req, res, next) {
    });
    // GET list of users
    // @TODO pagination
    app.get('/users', function(req, res, next) {
      var filter = { name: true };
      User.find({}, filter, function(err, users) {
        if (err) return next(err);
        return res.json(users);
      });
    });

    // GET user by ID
    app.get('/users/:userId', function(req, res, next) {
      User.findById(req.params.userId)
        .exec(function(err, user) {
          if (err) return next(err);
          if (!user) return next(null, false);
          return res.json(user);
        });
    });

    // GET courses by userId
    app.get('/users/:userId/courses', function(req, res, next) {
      var query = { "students.userId": req.params.userId };
      var filter = { name: true };
      Course.find(query, filter)
        .exec(function(err, courses) {
          return res.json(courses);
        });
    });
  }
};

module.exports = UserCtrl;
