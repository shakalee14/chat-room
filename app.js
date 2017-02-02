var express = require('express')
var app = express();
var port = process.env.PORT || 8282;
var io = require('socket.io').listen(app.listen(port));

require('./config')(app, io);
require('./routes')(app, io);
