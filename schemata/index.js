var baucis = require('baucis');
var mongoose = require('mongoose');

var User = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('User', User);
baucis.rest('User');

var Course = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('Course', Course);
baucis.rest('Course');

var AssignmentSubmission = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('AssignmentSubmission', AssignmentSubmission);
baucis.rest('AssignmentSubmission');

var AssessmentSubmission = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});
mongoose.model('AssessmentSubmission', AssessmentSubmission);
baucis.rest('AssessmentSubmission');

var Event = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
});
mongoose.model('Event', Event);
baucis.rest('Event');

var Section = new mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    index: {
      unique: true
    }
  },
  students: {
    type: [{
      id: {
        type: String,
        required: true
      },
      assignments: {
        type: [AssignmentSubmission],
        default: []
      },
      assessments: {
        type: [AssessmentSubmission],
        default: []
      }
    }],
    default: []
  },
  events: {
    type: [Event],
    default: []
  }
});
mongoose.model('Section', Section);
baucis.rest('Section');
