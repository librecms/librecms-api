var mongoose = require('mongoose');

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
    type: Number,
    required: true
  },
  end: {
    type: Number,
    required: true
  },
  completed: {
    type: Boolean, 
    default: false,
    required: true
  }
});
mongoose.model('Event', Event);

module.exports = Event;
