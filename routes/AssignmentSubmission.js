var mongoose = require('mongoose');

var AssignmentSubmission = mongoose.model('AssignmentSubmission');
var Course = mongoose.model('Course');


var AssignmentSubmissionCtrl = {
  init: function(app) {
    app.post('/courses/:courseId/assignments/:assignmentId', function(req, res, next) {

      req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
      req.assert('assignmentId').is(/^[0-9a-fA-F]{24}$/);
      req.checkBody('studentId', 'invalid studentId').notEmpty();

      var errors = req.validationErrors();
      if (errors) {
        return res.send('There have been validation errors: ' + util.inspect(errors), 400);
      }

      var query = {
        _id: req.params.courseId,
        "assignments._id": req.params.assignmentId,
        "students.userId": req.body.studentId
      };
      console.dir(query);
      Course.findOne(query, {students: true, assignments: true})
        .exec(function(err, course) {
          if (err) return next(err);
          if (!course) return next(null, false);

          var submission = new AssignmentSubmission({
            description: req.body.description,
            posted: (new Date()).getTime(),
            courseId: req.params.courseId,
            studentId: req.body.studentId,
            assignmentId: req.params.assignmentId
          });

          submission.save(function(err) {
            if (err) return next(err);
            return res.json(201, submission);
          });
        });


    });
  }
};

module.exports = AssignmentSubmissionCtrl;
