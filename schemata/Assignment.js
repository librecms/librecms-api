var mongoose = require('mongoose');

var Assignment = new mongoose.Schema({
  due: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  posted: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  grades: [{
    studentName: {
      type: String,
      required: true
    },
    studentId: {
      type: String,
      required: true
    },
    studentGrade: {
      type: String,
      required: true
    }
  }]
});

mongoose.model('Assignment', Assignment);

module.exports = Assignment;
