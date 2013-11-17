var mongoose = require('mongoose');

var AssignmentSubmission = new mongoose.Schema({
  description: String,
  collaborators: [String],
  attachments: [String],
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
