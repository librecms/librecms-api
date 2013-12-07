var mongoose = require('mongoose');

var Grade = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: false
  },
  studentName: {
    type: String,
    required: true,
    unique: false
  },
  assignmentId: {
    type: String,
    required: true,
    unique: false
  },
  courseId: {
    type: String,
    required: true,
    unique: false
  },
  submissionId: {
    type: String,
    required: true,
    unique: false
  },
  value: {
    type: String,
    required: true,
    unique: false
  }
});

mongoose.model('Grade', Grade);

module.exports = Grade;
