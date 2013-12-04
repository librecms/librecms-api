var mongoose = require('mongoose');

var AssignmentSubmission = new mongoose.Schema({
  studentName: {
    type: String,
    required: true
  },
  description: String,
  collaborators: [String],
  attachments: [{
    path: {
      type: String,
      required: true
    },
    basename: {
      type: String,
      required: true
    },
    uploadPath: {
      type: String,
      required: true
    }
  }],
  courseId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  assignmentId: {
    type: String,
    required: true
  },
  posted: Number
});
mongoose.model('AssignmentSubmission', AssignmentSubmission);

module.exports = AssignmentSubmission;
