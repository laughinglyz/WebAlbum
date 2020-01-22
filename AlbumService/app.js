var express = require('express');
var path = require('path');
var app = express();
var albumRouter = require('./routes/album');



app.use(express.static(path.join(__dirname, 'public')));

app.use('/', albumRouter);

var server = app.listen(3002, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
  });
