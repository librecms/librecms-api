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
  startDate: {
    type: Number,
    required: true
  },
  endDate: {
    type: Number,
    required: true
  }
});
mongoose.model('Event', Event);

module.exports = Event;
