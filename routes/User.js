var mongoose = require('mongoose');
var util = require('util');

var User = mongoose.model('User');
var Course = mongoose.model('Course');

var UserCtrl = {
  init: function(app) {
    app.post('/users', function(req, res, next) {
      req.checkBody('firstName', 'invalid firstName').notEmpty();
      req.checkBody('lastName', 'invalid lastName').notEmpty();
      req.checkBody('userName', 'invalid userName').notEmpty();
      req.checkBody('password', 'invalid password').notEmpty();
      req.checkBody('role', 'invalid role').notEmpty();
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      console.log(JSON.stringify(req.body));

      var newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        userName: req.body.userName,
        role: req.body.role,
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
      var filter = { userName: true, firstName: true, lastName: true };
      User.find({}, filter, function(err, users) {
        if (err) return next(err);
        return res.json(users);
      });
    });

    // GET user by ID
    app.get('/users/:userId', function(req, res, next) {
      req.assert('userId').is(/^[0-9a-fA-F]{24}$/);
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var query = {
        _id: req.params.userId
      };
      User.findOne(query)
      .exec(function(err, user) {
        if (err) return next(err);
        if (!user) return next(null, false);
        user.getCourses(function(err, courses) {
            // Mongoose items are immutable! Must convert to object first.
            user = user.toObject();
            user.courses = courses;
            return res.json(user);
          });
      });
    });

    // GET courses by userId
    app.get('/users/:userId/courses', function(req, res, next) {
      var query = { 
        $or: [
        { students: req.params.userId },
        { instructors: req.params.userId }
        ]
      };
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
        return res.send('There have been validation errors: safd' + util.inspect(errors), 400);
      }

      var start = req.query.start;

      var pipe = [
      { $match: { students: req.params.userId } },
      { $project: {_id: false, events: true } },
      { $unwind: "$events" },
      { $match: {"events.start": { $gte: Number(start) } } }
      ];

      Course.aggregate(pipe, function(err, results) {
        if (err) return next(err);
        if (!results) return next(null, false);
        var events = [];
        results.forEach(function(result) {
          console.log(JSON.stringify(result.events));
          events.push(result.events);
        });
        return res.json(events);
      });
    });

    // toggle clicked event status
    app.get('/users/:userId/events/:eventId', function(req, res) {
      req.assert('userId').is(/^[0-9a-fA-F]{24}$/);
      req.assert('eventId').is(/^[0-9a-fA-F]{24}$/);

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var start = req.query.start;

      var pipe = [
      { $match: { students: req.params.userId } },
      { $project: {_id: false, events: true } },
      { $unwind: "$events" }
      ];

      Course.aggregate(pipe, function(err, results) {
        
        if (err) return next(err);
        if (!results) return next(null, false);
        var events = [];
        results.forEach(function(result) {
          console.log(result.events._id);
          console.log(req.params.eventId);
          if(result.events._id == req.params.eventId) {
            results.events.completed = !results.events.completed;
            events.push(result.events);
            }
        });
        return res.json(events);
      });
    });
  }
}

module.exports = UserCtrl;