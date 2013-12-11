var mongoose = require('mongoose');
var util = require('util');
ObjectId = mongoose.Types.ObjectId;

var User = mongoose.model('User');
var Course = mongoose.model('Course');
var Grade = mongoose.model('Grade');

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
      //db.courses.aggregate([{$match:{$or: [{students:"52868c9738f0777b4e000008"},{instructors:"52868c9738f0777b4e000008"}]}},{$unwind:"$posts"},{$sort:{"posts.date":-1}}])
      var pipe = [
      { $match: { $or: [ { students: req.params.userId },{ instructors: req.params.userId } ] } },
      { $unwind: "$posts" },
      { $sort: { "posts.date" : -1 } },
      //{ $group: { _id:"$students", posts:{$addToSet:"$posts"} } }
      ];

      Course.aggregate(pipe, function(err, results) {
        if (err) return next(err);
        if (!results) return next(null, false);
        var posts = [];
        results.forEach(function(result) {
          result.posts.name = result.name;
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
            return res.json(course.assignments);
          });
      });
    });

    app.get('/users/:userId/grades', 
      function(req, res, next) {
        
        // @TODO not done with calculating courses' lettergrades
        function courseCallback(err, courses) {
          if (err) return next(err);
          if (!courses) return res.status(200).end();
          var maxPointsByCourseId = {};
          var usersPointByCourseId = {};
          courses.forEach(function(course) {
            course.assignments.forEach(function(assignment) {
              if (!gradesByAssignmentId.hasOwnProperty(assignment._id) &&
                  assignment.due > now) {
                return;
              } else {
              }
            });
          });
          return res.status(200).end();
        }

        function gradeCallback(err, grades) {
          var gradesByCourseId = {};
          grade.forEach(function(grade) {
            if (!gradesByCourseId.hasOwnProperty(grade.courseId)) {
              gradesByCourseId[grade.courseId] = [];
            }
            gradesByCourseId[grade.courseId].push(grade);

            if (!gradesByAssignmentId.hasOwnProperty(grade.assignmentId)) {
              gradesByAssignmentId[grade.assignmentId] = [];
            }
            gradesByAssignmentId[grade.assignmentId].push(grade);
          });
          var courseIds = Object.keys(gradesByCourseId);
          var courseQuery = { _id: { $in: courseIds } };
          var courseFilter = { assignments: true };
          Course.find(courseQuery, courseFilter).exec(courseCallback);
        }

        var gradeQuery = { studentId: req.user._id };
        Grade.find(gradeQuery).exec(gradeCallback);
    });
  }
};

module.exports = UserCtrl;
