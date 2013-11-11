var mongoose = require('mongoose');
var util = require('util');

var User = mongoose.model('User');
var Course = mongoose.model('Course');

var UserCtrl = {
  init: function(app) {
    app.post('/users', function(req, res, next) {
      var newUser = new User({
        name: {
          first: req.body.firstName,
          last: req.body.lastName,
          user: req.body.userName
        },
        password: req.body.password
      });
      newUser.save(function(err) {
        if (err) return next(err);
        return res.json(201, newUser);
      });
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

    // GET events by userId
    app.get('/users/:userId/events', function(req, res, next) {

      req.assert('userId').is(/^[0-9a-fA-F]{24}$/);
      req.assert('start', 'Invalid start').isInt();
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var start = req.query.start;

      var pipe = [
        { $match: { "students.userId": req.params.userId } },
        { $project: {_id: false, events: true } },
        { $unwind: "$events" },
        { $match: {"events.start": { $gte: Number(start) } } }
      ];

      Course.aggregate(pipe, function(err, results) {
        if (err) return next(err);
        if (!results) return next(null, false);
        var events = [];
        results.forEach(function(result) {
          events.push(result.events);
        });
        return res.json(events);
      });
    });
  }
};

module.exports = UserCtrl;
