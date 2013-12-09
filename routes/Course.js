var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var util = require('util');
var auth = require('../auth');

var Assessment = mongoose.model('Assessment');
var Assignment = mongoose.model('Assignment');
var AssignmentSubmission = mongoose.model('AssignmentSubmission');
var Course = mongoose.model('Course');
var Event = mongoose.model('Event');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Grade = mongoose.model('Grade');

var CourseCtrl = {
  init: function(app) {
    // ******** Course **********
    // GET list of courses
    app.get('/courses', function(req, res, next) {
      var filter = {};
      Course.find({}, filter)
        .exec(function(err, courses) {
          if (err) return next(err);
          return res.json(courses);
      });
    });

    // Create new course
    app.post('/courses', function(req, res, next) {
      req.checkBody('name', 'Name must not be empty').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var newCourse = new Course({ 
        name: req.body.name 
      });
      newCourse.save(function(err) {
        if (err) return next(err);
        return res.json(201, newCourse);
      });
    });

    // Get course by id
    app.get('/courses/:courseId', function(req, res, next) {

      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var query = {
        _id: req.params.courseId
      };
      Course.findOne(query)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(course);
        });
    });

    // Register a User to a Course (add user to 'students' set)
    app.post('/courses/:courseId/register', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.checkBody('userId', /^[0-9a-fA-F]{24}$/);
      req.checkBody('role', 'invalid role').notEmpty();
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var update;
      if(req.body.role == 'student') {
        update = { $addToSet: { students: req.body.userId } };
      } else if (req.body.role ==='instructor') {
        update = { $addToSet: { instructors: req.body.userId }};
      } else {
        return res.send('user must be a student or instructor', 400);
      }

      var query = { _id: req.params.courseId };
      Course.findOneAndUpdate(query, update)
        .exec(function(err, course) {

          if (err) return next(err);
          if (!course) return next(null, false);
          return res.status(200).end();
        });
    });

    // ******** Course Timeline Posts **********
    // Create new post
    app.post('/courses/:courseId/posts', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.checkBody('text', 'invalid text').notEmpty();
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var newPost = new Post({
        date: (new Date()).getTime(),
        text: req.body.text 
      });
      var query = { _id: req.params.courseId };
      var update = { $push: { posts: newPost } };
      var options = { "new": true };
      Course.findOneAndUpdate(query, update, options)
        .exec(function(err, course) {
          if (err) return next(err);
          return res.json(201, newPost);
        });
    });

    // Get posts by course ID
    // @TODO pagination
    app.get('/courses/:courseId/posts', function(req, res, next) {
      
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: safd' + util.inspect(errors), 400);
      }

      //var start = req.query.start;
      //db.courses.aggregate( [ { $match: { _id:ObjectId("5297c0abec00cb1de900000d") } },{ $unwind:"$posts" },{ $sort:{ "posts.date":-1 } } ] )
      var pipe = [
      { $match: { _id: ObjectId(req.params.courseId) } },
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

    // ******** Course Events **********
    // Create new event
    app.post('/courses/:courseId/events', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.checkBody('start', 'invalid start').notEmpty().isInt();
      req.checkBody('end', 'invalid end').notEmpty().isInt();
      req.checkBody('description', 'invalid description').notEmpty();
      req.checkBody('title', 'invalid title').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var newEvent = new Event({
        start: req.body.start,
        end: req.body.end,
        description: req.body.description,
        title: req.body.title
      });

      var update = { $push: { events: newEvent } };
      var options = { "new": true };
      var query = { _id: req.params.courseId };
      Course.findOneAndUpdate(query, update, options)
        .exec(function(err, course) {
          if (err) return next(err);
          return res.json(201, newEvent);
        });
    });

    // Get events by course ID
    // @TODO pagination
    // @TODO query by dates
    app.get('/courses/:courseId/events', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/); 
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var filter = { events: true };
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(course.events || []);
        });
    });

    // ******** Course Assignments **********
    // Get assignments by course ID
    app.get('/courses/:courseId/assignments', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var filter = { assignments: true };
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(course.assignments || []);
        });
    });

    // Create new assignment by courseId
    app.post('/courses/:courseId/assignments', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.checkBody('due', 'Invalid Due Date').notEmpty().isInt();
      req.checkBody('description', 'Description Must Not Be Empty').notEmpty();
      req.checkBody('title', 'Title Must Not Be Empty').notEmpty();
      req.checkBody('points', 'Points must be an Integer').isInt();

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var newAssignment = new Assignment({
        due: req.body.due,
        description: req.body.description,
        posted: (new Date()).getTime(),
        attachments: req.body.attachments,
        title: req.body.title,
        points: req.body.points
      });
      var query = { _id: req.params.courseId };
      var update = { $push: { assignments: newAssignment } };
      Course.findOneAndUpdate(query, update)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(newAssignment);
        });
    });

    // Get assignment by assignmentID and course Id
    app.get('/courses/:courseId/assignments/:assignmentId', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.assert('assignmentId').is(/^[0-9a-fA-F]{24}$/);
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var assignmentId = ObjectId.fromString(req.params.assignmentId);
      var courseId = ObjectId.fromString(req.params.courseId);

      var pipe = [
        { $match: { _id: courseId, "assignments._id": assignmentId } },
        { $unwind: "$assignments" },
        { $match: {"assignments._id": assignmentId } },
        { $project: { _id: false, assignments: true } }
      ];
      Course.aggregate(pipe, function(err, result) {
        if (err) return next(err);
        if (!result) return next(null, false);
        if (result.length === 0) return next(null, false);
        var assignment = result[0].assignments;
        if (!assignment) return next(null, false);

        var submissionQuery = {
          assignmentId: assignment._id
        };
        AssignmentSubmission.find(submissionQuery)
          .exec(function(err, submissions) {
            if (err) return next(err);
            assignment.submissions = submissions;
            return res.json(assignment);
          });
      });
    });

    //Update assignment by assignmentId and courseId
    app.put('/courses/:courseId/assignments/:assignmentId', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.checkBody('due', 'invalid due date').notEmpty().isInt();
      req.checkBody('description', 'invalid description').notEmpty();
      req.checkBody('title', 'invalid title').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }
      
      var updateAssignment = {
        due: req.body.due,
        description: req.body.description,
        title: req.body.title,
        attachments: req.body.attachments
      };
      var query = { 
        _id: req.params.courseId,
        "assignments._id" : req.body._id
      };
      var update = { $push: { assignments: updateAssignment } };
      Course.findOneAndUpdate(query, update)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(updateAssignment);
        });
    });

    // ******** Course Notes **********
    // Get notes by course ID
    // @TODO pagination
    app.get('/courses/:courseId/notes', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var filter = { notes: true };
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(course.notes || []);
        });
    });

    // Create a new note given courseId
    app.post('/courses/:courseId/notes', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.checkBody('due', 'invalid due date').notEmpty().isInt();
      req.checkBody('description', 'invalid description').notEmpty();
      req.checkBody('title', 'invalid title').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var newNote = new Note({
        due: req.body.due,
        description: req.body.description,
        posted: (new Date()).getTime(),
        title: req.body.title
      });
      var query = { _id: req.params.courseId };
      var update = { $push: { notes: newNote } };
      Course.findOneAndUpdate(query, update)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(newNote);
        });
    });

    // ******** Course Grades **********
    // Get grades by course ID
    app.get('/courses/:courseId/users/:userId/grades', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var filter = { grades: true };
      var query = { 
        students: req.params.userId,
        _id: req.params.courseId,
      };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(course.grades || []);
        });
    });

    app.get('/courses/:courseId/grades',
      auth.ensureAuthenticated,
      function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      Course.findOne({_id: req.params.courseId})
        .then(function(err, course) {
          if (err) return next(err);
          if (!course) return res.status(404).end();
          course = course.toObject();
          var gradeQuery = {
            studentId: req.user._id,
            courseId: req.params.courseId
          };
          Grade.find(gradeQuery)
            .exec(function(err, grades) {
              if (err) return next(err);
              var gradeByAssignmentId = {};
              grades.forEach(function(grade) {
                if (gradeByAssignmentId.hasOwnProperty(grade.assignmentId)) {
                  var existingGrade = gradeByAssignmentId[grade.assignmentId];
                  if (grade.posted > existingGrade.posted) {
                    gradeByAssignmentId[grade.assignmentId] = grade;
                  }
                } else {
                  gradeByAssignmentId[grade.assignmentId] = grade;
                }

              });
            });
        });
    });

    app.get('/courses/:courseId/students', function(req, res, next) {
      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var courseQuery = { _id: req.params.courseId };
      var courseFilter = { students: true };
      Course.findOne(courseQuery, courseFilter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);

          var studentIds = course.toObject().students;
          studentIds = studentIds.map(function(studentId) {
            return (studentId);
          });
          var userQuery = { _id: { $in: studentIds } };
          var userFilter = { firstName: true, lastName: true, _id: true };
          User.find(userQuery, userFilter)
            .exec(function(err, users) {
              if (err) return next(err);
              return res.json(users);
            });
        });
    });
  }
};

module.exports = CourseCtrl;
