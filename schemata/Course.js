var mongoose = require('mongoose');
var AssessmentSubmission = require('./AssessmentSubmission');
var Assignment = require('./Assignment');
var AssignmentSubmission = require('./AssignmentSubmission');
var Content = require('./Content');
var Event = require('./Event');
var Post = require('./Post');

var Course = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  students: {
    type: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      assignments: [AssignmentSubmission],
      assessments: [AssessmentSubmission]
    }]
  },
  events: {
    type: [Event]
  },
  assignments: {
    type: [Assignment]
  }
});
mongoose.model('Course', Course);

module.exports = Course;
