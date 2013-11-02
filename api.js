var express = require('express');
var mongoose = require('mongoose');
var baucis = require('baucis');

mongoose.connect(process.env.LIBRECMS_MONGO_URI);

var schemata = require('./schemata');
var app = express();
var routes = require('./routes');
routes(app);
app.use(baucis());

app.listen(3000);
