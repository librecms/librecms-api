var mongoose = require('mongoose');
var util = require('util');
ObjectId = mongoose.Types.ObjectId;

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
        console.log(JSON.stringify(results));
        results.forEach(function(result) {
          assignments.push(result.assignments);
        });
        return res.json(assignments);
      });
    });

    // toggle clicked event status
    app.post('/users/:userId/events/:eventId', function(req, res, next) {
      req.assert('userId').is(/^[0-9a-fA-F]{24}$/);
      req.assert('eventId').is(/^[0-9a-fA-F]{24}$/);

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var toggleId = ObjectId(req.params.eventId);
      var user = req.params.userId;

      Course.findOne({'assignments._id' : toggleId}, function(err, course) {
        if (err) return next(err);
        if (!course) return next(null, course);

        course = course.toObject();
        course.assignments.forEach(function(assignment) {
          if (assignment._id.toString() !== toggleId.toString()) return; 
          var position = assignment.completed.indexOf(user);
          if (position >= 0) {
            assignment.completed.splice(position,1);
          } else {
            assignment.completed.push(user);
          }
        });

        Course.update({_id: course._id}, {$set: {assignments: course.assignments}},
          function(err, numAff) {
            if(err) return next(err);
            if (!numAff) return next(null, false);
            return res.status(200).end();
          });
      });
    });
  }
}

module.exports = UserCtrl;
