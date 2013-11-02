var baucis = require('baucis');
var dive = require('diveSync');
var mongoose = require('mongoose');

dive(process.cwd() + '/schemata', function(err, file) {
  var schema = require(file);
  if (schema && schema.label) {
    var model = new mongoose.Schema(schema.schema);
    mongoose.model(schema.label, model);
    baucis.rest(schema.label);
  }
});
