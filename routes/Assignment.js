var mongoose = require('mongoose');
var Submission = mongoose.model('AssignmentSubmission');
var auth = require('../auth');

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
  }
};

module.exports = AssignmentCtrl;
