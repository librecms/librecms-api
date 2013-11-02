var express = require('express');
var mongoose = require('mongoose');
var baucis = require('baucis');

mongoose.connect(process.env.LIBRECMS_MONGO_URI);

var schemata = require('./schemata');
var app = express();
var routes = require('./routes');
app.use(baucis());

var port = process.env.LIBRECMS_API_PORT || process.env.PORT || 3030
app.listen(port);
console.log('API started on port ' + port);
