var mongoose = require('mongoose');
var Course = mongoose.model('Course');
var Event = mongoose.model('Event');
var Post = mongoose.model('Post');

var CourseCtrl = {
  init: function(app) {
    app.get('/courses/:courseId', function(req, res, next) {
      Course.findOne(req.params.courseId)
        .exec(function(err, course) {
          if (err) next(err);
          if (!course) return res.end(404);
          return res.json(course);
        });
    });

    // ******** Course Events **********
    // GET events list. Does not yet limit or filter
    // @TODO pagination 
    // see https://github.com/librecms/librecms-api/issues/2
    app.get('/courses/:courseId/events', function(req, res, next) {
      Course.findOne(req.params.courseId)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(200, course.events || []);
        });
    });

    // Create new calendar event for course
    // requires fields: text
    // optional fields: generated (default to false)
    // responds with new post
    app.post('/courses/:courseId/events', function(req, res, next) {
      var query = req.param.courseId;
      var newEvent = new Event({
        title: req.body.title,
        description: req.body.description,
        start: req.body.start,
        end: req.body.end
      });
      var update = {
        $push: { 
          "events": newEvent
        }
      };

      Course.findOneAndUpdate(req.param.courseId)
        .exec(function(err, course) {
          if (err) return next(err);
          return res.json(201, newEvent);
        });
    });

    // ******** Course Posts **********
    // GET posts list.
    // @TODO pagination 
    // see https://github.com/librecms/librecms-api/issues/2
    app.get('/courses/:courseId/posts', function(req, res, next) {
      var endDate = req.params.endDate || new Date();
      var pipeline = [
        {
          $match: { 
            "_id": mongoose.Types.ObjectId(req.params.courseId),
            "posts.date": { $lte: endDate }
          }
        },
        { $unwind: "$posts" },
        {
          $group: {
            _id: "$_id",
            posts: { $addToSet: "$posts" }
          }
        },
        { 
          $sort: { date: -1 } 
        },
        {
          $limit: 20
        }
      ];
      Course.aggregate(pipeline, function(err, result) {
        if (err) return next(err);
        if (!result) return next(null, false);
        return res.json(200, result[0].posts || []);
      });
    });

    // Create new timeline post for course
    // requires fields: text
    // optional fields: generated (default to false)
    // responds with new post
    app.post('/courses/:courseId/posts', function(req, res, next) {
      var query = req.param.courseId;
      var newPost = new Post({
        text: req.body.text,
        date: new Date(),
        generated: req.body.generated || false
      });
      var update = {
        $push: { 
          "posts": newPost
        }
      };
      var options = { "new": true };
      Course.findOneAndUpdate(req.param.courseId, update, options)
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);
          return res.json(201, newPost);
        });
    });
  }
};

module.exports = CourseCtrl;
