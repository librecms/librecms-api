var mongoose = require('mongoose');

var Grade = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  assignmentId: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  submissionId: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  }
});

mongoose.model('Grade', Grade);

module.exports = Grade;
