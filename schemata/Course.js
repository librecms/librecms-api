var mongoose = require('mongoose');

var Assessment = require('./Assessment');
var Assignment = require('./Assignment');
var Content = require('./Content');
var Event = require('./Event');
var Note = require('./Note');
var Post = require('./Post');

var Course = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  students: {
    type: [String],
    required: false,
    default: []
  },
  instructors: {
    type: [String],
    required: false,
    default: []
  },
  posts: {
    type: [Post]
  },
  events: {
    type: [Event]
  },
  assignments: {
    type: [Assignment]
  },
  quizzes: {
    type: [Assessment]
  },
  exams: {
    type: [Assessment]
  },
  notes: {
    type: [Note]
  }
});
mongoose.model('Course', Course);

module.exports = Course;
