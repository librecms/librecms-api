module.exports = function(app) {
  var dive = require('diveSync');

  dive(process.cwd() + '/routes', function(err, file) {
    var schema = require(file);
    if (schema && schema.label) {
      var model = new mongoose.Schema(schema.schema);
      mongoose.model(schema.label, model);
      baucis.rest(schema.label);
    }
  });
};
