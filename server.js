
var express = require('express');
var app = express();
require('./controller/paramTemplateCtrl')(app);


app.get("/", function(req, res) {
//    res.send('Hello World');
    res.sendfile('./static/index.html')
});

app.get("/h", function(req, res, next) {
    res.send('Hello World');
});

app.use(express.static('static'));
// app.use("/static/js/controller", express.static('controller'));
app.use("/images", express.static('images'));
app.use("/conf", express.static('conf'));

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("server on http://%s:%s", host, port);
});
