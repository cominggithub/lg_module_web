
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
require('./controller/paramTemplateCtrl')(app);
require('./controller/taskCtrl')(app);


app.get("/", function(req, res) {
//    res.send('Hello World');
    res.sendfile('./static/index.html')
});

app.get("/h", function(req, res, next) {
    res.send('Hello World');
});

app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(bodyParser.json());
app.use(express.static('static'));
// app.use("/static/js/controller", express.static('controller'));
app.use("/images", express.static('images'));
app.use("/conf", express.static('conf'));
app.use("/tasks", express.static('tasks'));

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("server on http://%s:%s", host, port);
});
