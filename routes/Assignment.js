var mongoose = require('mongoose');
var auth = require('../auth');

var Submission = mongoose.model('AssignmentSubmission');
var Course = mongoose.model('Course');

var AssignmentCtrl = {
  init: function(app) {
    app.post('/courses/:courseId/assignments/:assignmentId/submit',
      auth.ensureAuthenticated,
      function(req, res, next) {
        req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
        req.assert('assignmentId').is(/^[0-9a-fA-F]{24}$/);
        
        var errors = req.validationErrors();
        if (errors) {
          return res.send('There have been validation errors: ' + util.inspect(errors), 400);
        }

        var student = req.user;
        if (!student || !student._id) {
          return res.status(401).end();
        }

        var newSubmission = new Submission({
          description: req.body.description,
          collaborators: req.body.collaborators,
          attachments: req.body.attachments,
          courseId: req.params.courseId,
          studentId: student._id,
          assignmentId: req.params.assignmentId,
          posted: (new Date()).getTime()
        });
        newSubmission.save(function(err) {
          if (err) return next(err);
          return res.json(newSubmission);
        });
      });

    app.del('/courses/:courseId/assignments/:assignmentId',
      auth.ensureAuthenticated,
      auth.ensureInstructor,
      function(req, res, next) {
        console.log('delete');
        req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
        req.assert('assignmentId').is(/^[0-9a-fA-F]{24}$/);
        var errors = req.validationErrors();
        if (errors) {
          return res.send('There have been validation errors: ' + util.inspect(errors), 400);
        }

        // Find course by this course/assignmetn id tuple
        var query = { 
          _id: req.params.courseId,
          "assignments._id": req.params.assignmentId,
          instructors: req.user._id
        };
        // Pull the assignment with this id from the assignments list.
        var update = {
          $pull: { assignments: { _id: req.params.assignmentId } }
        };
        var options = { 'new': true };
        Course.findOneAndUpdate(query, update, options)
          .exec(function(err, course) {
            if (err) return next(err);
            if (!course) return next(null, false);
            return res.status(200).end();
        });
      });
  }
};

module.exports = AssignmentCtrl;
