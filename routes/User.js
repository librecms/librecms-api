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

    // GET posts by userId
    app.get('/users/:userId/posts', function(req, res, next) {

      req.assert('userId').is(/^[0-9a-fA-F]{24}$/);
      //req.assert('start', 'Invalid start').isInt();
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: safd' + util.inspect(errors), 400);
      }

      //var start = req.query.start;
      //db.courses.aggregate([{$match:{students:"52868c8f38f0777b4e000007"}},{$unwind:"$posts"},{$group:{_id:"$students",posts:{$addToSet:"$posts"}}}])
      var pipe = [
      { $match: { students: req.params.userId } },
      { $unwind: "$posts" },
      { $sort: { "posts.date" : -1 } },
      //{ $group: { _id:"$students", posts:{$addToSet:"$posts"} } }
      ];

      Course.aggregate(pipe, function(err, results) {
        if (err) return next(err);
        if (!results) return next(null, false);
        var posts = [];
        results.forEach(function(result) {
          console.log(JSON.stringify(result.posts));
          posts.push(result.posts);
        });
        return res.json(posts);
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
      { $project: {_id: false, assignments: true } },
      { $unwind: "$assignments" },
      { $match: {"assignments.due": { $gte: Number(start) } } }
      ];

      Course.aggregate(pipe, function(err, results) {
        if (err) return next(err);
        if (!results) return next(null, false);
        var assignments = [];
        results.forEach(function(result) {
          console.log(JSON.stringify(result.assignments));
          assignments.push(result.assignments);
        });
        return res.json(assignments);
      });
    });

    // toggle clicked event status
    app.post('/users/:userId/events/:eventId', function(req, res) {
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
            if(results.events.completed.length == 0) {
              // add _id to list
            } else {
              for(var i=0; i<results.events.completed.length; i++) {
                if(req.params.userId == results.events.completed[i]) {
                  // remove _id from list
                } else {
                  // add _id to list
                }
              }
            }
          }
        });
        return res.json(events);
      });
    });
  }
}

module.exports = UserCtrl;