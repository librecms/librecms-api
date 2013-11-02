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
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  }
});
mongoose.model('Event', Event);

module.exports = Event;
