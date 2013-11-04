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
      userId: {
        type: String,
        required: true
      },
      assignments: {
        type: [AssignmentSubmission],
        default: [],
        unique: false,
        indexed: false
      },
      assessments: {
        type: [AssessmentSubmission],
        default: [],
        unique: false,
        indexed: false
      }
    }],
    default: [],
    unique: false,
    indexed: false
  },
  posts: {
    type: [Post]
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
