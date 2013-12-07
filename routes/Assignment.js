var mongoose = require('mongoose');
var auth = require('../auth');
var util = require('util');

var Submission = mongoose.model('AssignmentSubmission');
var Course = mongoose.model('Course');
var Grade = mongoose.model('Grade');

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
          studentName: student.firstName + " " + student.lastName,
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
            return res.json(course.assignments);
        });
      });

    app.get('/courses/:courseId/assignments/:assignmentId/grades',
      auth.ensureAuthenticated,
      auth.ensureInstructor,
      function(req, res, next) {
        var query = {
          courseId: req.params.courseId,
          assignmentId: req.params.assignmentId
        };
        Grade.find(query)
          .exec(function(err, grades) {
            if (err) return next(err);
            return res.json(grades);
          });
      });

    app.post('/courses/:courseId/assignments/:assignmentId/grades',
      auth.ensureInstructor,
      auth.ensureAuthenticated,
      function(req, res, next) {
        req.assert('value').isInt();
        req.assert('assignmentId').is(/^[0-9a-fA-F]{24}$/);
        req.assert('courseId').is(/^[0-9a-fA-F]{24}$/);
        var errors = req.validationErrors();
        if (errors) {
          return res.send('There have been validation errors: ' + util.inspect(errors), 400);
        }
        var isInstructorQuery = {
          instructors: req.user._id,
          _id: req.params.courseId
        };
        var isInstructorFilter = {
          instructors: true
        };
        Course.find(isInstructorQuery, isInstructorFilter)
          .exec(function(err, course) {
            if (err) return next(err);
            if (!course) return res.status(401).end();
            var gradeQuery = { _id: req.body.gradeId };
            var gradeUpdate = { $set: { value: req.body.value } };
            Grade.findOneAndUpdate(gradeQuery, gradeUpdate)
              .exec(function(err, grade) {
                if (err) return next(err);
                if (grade) return res.json(grade);

                req.checkBody('studentId').is(/^[0-9a-fA-F]{24}$/);
                req.checkBody('studentName').notEmpty();
                req.checkBody('submissionId').is(/^[0-9a-fA-F]{24}$/);
                req.checkBody('value').isInt();
                var gradeErrors = req.validationErrors();
                if (gradeErrors) {
                  return res.send('There have been validation errors: safd' + util.inspect(gradeErrors), 400);
                }
                var newGrade = new Grade({
                  studentId: req.body.studentId,
                  studentName: req.body.studentName,
                  assignmentId: req.params.assignmentId,
                  courseId: req.params.courseId,
                  submissionId: req.body.submissionId,
                  value: req.body.value
                });
                newGrade.save(function(err) {
                  if (err) return next(err);
                  return res.json(newGrade);
                });
              });
          });
      });
  }
};

module.exports = AssignmentCtrl;
