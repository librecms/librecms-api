var mongoose = require('mongoose');

var Post = new mongoose.Schema({
  date: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  generated: {
    type: Boolean,
    required: true
  }
});

mongoose.model('Post', Post);
module.exports = Post;
