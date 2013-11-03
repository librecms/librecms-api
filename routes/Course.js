var mongoose = require('mongoose');
var Course = mongoose.model('Course');
var Event = mongoose.model('Event');
var Post = mongoose.model('Post');

var CourseCtrl = {
  init: function(app) {
    // ******** Course **********
    // Create new course
    app.post('/courses', function(req, res, next) {
      var newCourse = new Course({ name: req.body.name });
      newCourse.save(function(err) {
          if(err) throw err;
          return res.json(newCourse);
        });
    });

    // Get course by id
    app.get('/courses/:courseId', function(req, res, next) {
      Course.findOne(req.params.courseId)
        .exec(function(err, course) {
          if (err) next(err);
          if (!course) return res.end(404);
          return res.json(course);
        });
    });

    // ******** Course Timeline Posts **********
    // Create new post
    app.post('/courses/:courseId/posts', function(req, res, next) {
      var newPost = new Post({
        date: (new Date()).getTime(),
        text: req.body.text 
      });
      var update = { $push: { posts: newPost } };
      var options = { "new": true };
      Course.findOneAndUpdate(req.params.courseId, update, options)
        .exec(function(err, course) {
          if (err) throw err;
          return res.json(course);
        });
    });

    // Get posts by course ID
    // @TODO pagination
    app.get('/courses/:courseId/posts', function(req, res, next) {
      var filter = { posts: true };
      var startDate = req.body.startDate || (new Date()).getTime();
      var query = { _id: req.params.courseId };
      Course.findOne(query)
        .exec(function(err, course) {
          if (err) throw err;
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
      Course.findOneAndUpdate(req.params.courseId, update, options)
        .exec(function(err, course) {
          if (err) throw err;
          return res.json(course);
        });
    });

    // Get events by course ID
    // @TODO pagination
    app.get('/courses/:courseId/events', function(req, res, next) {
      var filter = { posts: true };
      var query = { _id: req.params.courseId };
      Course.findOne(query)
        .exec(function(err, course) {
          if (err) throw err;
          if (!course) return res.end(404);
          return res.json(course.events || []);
        });
    });

  }
};

module.exports = CourseCtrl;
