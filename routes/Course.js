var mongoose = require('mongoose');
var Course = mongoose.model('Course');
var Event = mongoose.model('Event');
var Post = mongoose.model('Post');
var User = mongoose.model('User');
var Assignment = mongoose.model('Assignment');

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
      var query = {
        _id: req.params.courseId
      };
      Course.findOne(query)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(course);
        });
    });

    // Register a User to a Course (add user to 'students' set)
    app.post('/courses/:courseId/register', function(req, res, next) {
      var student = {
        userId: req.body.studentId
      };
      var update = { $addToSet: { students: student } };
      var query = { _id: req.params.courseId };
      Course.findOneAndUpdate(query, update)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          res.status(200);
          return res.end();
        });
    });

    // ******** Course Timeline Posts **********
    // Create new post
    app.post('/courses/:courseId/posts', function(req, res, next) {
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
      var filter = { posts: true };
      var startDate = req.body.startDate || (new Date()).getTime();
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(course.posts || []);
        });
    });

    // ******** Course Events **********
    // Create new event
    app.post('/courses/:courseId/events', function(req, res, next) {
      var newEvent = new Event({
        startDate: req.body.startDate,
        endDate: req.body.endDate,
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
      var filter = { events: true };
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(course.events || []);
        });
    });

    // ******** Course Assignments **********
    // Get assignments by course ID
    // @TODO pagination
    app.get('/courses/:courseId/assignments', function(req, res, next) {
      var filter = { assignments: true };
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(course.assignments || []);
        });
    });

    app.post('/courses/:courseId/assignments', function(req, res, next) {
      var newAssignment = new Assignment({
        due: req.body.due,
        description: req.body.description,
        posted: (new Date()).getTime()
      });
      var query = { _id: req.params.courseId };
      var update = { $push: { assignments: newAssignment } };
      Course.findOneAndUpdate(query, update)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(newAssignment);
        });
    });

    // Get exams by course ID
    // @TODO pagination
    app.get('/courses/:courseId/exams', function(req, res, next) {
      var filter = { exams: true };
      var startDate = req.body.startDate || (new Date()).getTime();
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(course.exams || []);
        });
    });

    // Get notes by course ID
    // @TODO pagination
    app.get('/courses/:courseId/notes', function(req, res, next) {
      var filter = { notes: true };
      var startDate = req.body.startDate || (new Date()).getTime();
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(course.notes || []);
        });
    });

    // Get quizzes by course ID
    // @TODO pagination
    app.get('/courses/:courseId/quizzes', function(req, res, next) {
      var filter = { quizzes: true };
      var startDate = req.body.startDate || (new Date()).getTime();
      var query = { _id: req.params.courseId };
      Course.findOne(query, filter)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return res.end(404);
          return res.json(course.quizzes || []);
        });
    });
  }
};

module.exports = CourseCtrl;
