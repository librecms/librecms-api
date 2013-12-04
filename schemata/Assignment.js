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
  completed: {
    type: [String],
    required: true,
    default: []
  }
});

mongoose.model('Assignment', Assignment);

module.exports = Assignment;
