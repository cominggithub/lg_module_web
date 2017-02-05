var express = require('express');
var app = express();

app.get("/", function(req, res) {
//    res.send('Hello World');
    res.sendfile('./static/index.htm')
});

app.use(express.static('static'));
app.use("/controller", express.static('controller'));
app.use("/images", express.static('images'));

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("server on http://%s:%s", host, port);
});
