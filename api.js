var express = require('express');
var mongoose = require('mongoose');
var connect = require('connect');

mongoose.connect(process.env.LIBRECMS_MONGO_URI);
var schemata = require('./schemata');

var app = express();
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(connect.logger('tiny'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

var routes = require('./routes');
routes.init(app);

var port = process.env.LIBRECMS_API_PORT || process.env.PORT || 3030;
app.listen(port);
console.log('API started on port ' + port);
