var express = require('express');
var mongoose = require('mongoose');

mongoose.connect(process.env.LIBRECMS_MONGO_URI);
var schemata = require('./schemata');

var app = express();
app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
  };
  app.use(allowCrossDomain);
});

var routes = require('./routes');
routes.init(app);

var port = process.env.LIBRECMS_API_PORT || process.env.PORT || 3030;
app.listen(port);
console.log('API started on port ' + port);
