var mongoose = require('mongoose');

var AssignmentSubmission = new mongoose.Schema({
  description: String,
  attachments: [String]
});
mongoose.model('AssignmentSubmission', AssignmentSubmission);

module.exports = AssignmentSubmission;
