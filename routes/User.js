var mongoose = require('mongoose');
var User = mongoose.model('User');
var Course = mongoose.model('Course');

var UserCtrl = {
  init: function(app) {
    app.get('/users/:userId', function(req, res, next) {
      console.log('here' + req.params.userId);
      User.findById(req.params.userId)
        .exec(function(err, user) {
          if (err) return next(err);
          if (!user) return next(null, false);
          return res.json(user);
        });
    });

    app.get('/users/:userId/courses', function(req, res, next) {
      var query = { "students.userId": req.params.userId };
      var filter = { name: true };
      Course.find(query, filter)
        .lean()
        .exec(function(err, courses) {
          console.log(JSON.stringify(courses));
          return res.json(courses);
        });
    });
  }
};

module.exports = UserCtrl;
