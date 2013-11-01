var mongoose = require('mongoose');

var User = new mongoose.Schema({
  name: String
});

mongoose.model('User', User);
