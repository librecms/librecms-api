var express = require('express');
var mongoose = require('mongoose');
var baucis = require('baucis');


mongoose.connect('mongodb://localhost/librecms');

var schemata = require('./schemata');
var app = express();
app.use('/api/v0/', baucis());
app.listen(3000);
console.log('listening');
