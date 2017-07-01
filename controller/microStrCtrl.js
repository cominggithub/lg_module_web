var _ = require('lodash');
var fs = require('fs');

var formidable = require('formidable');
var filesPath = "./conf/micro_str";
var files = [];

function init() {
    console.log("get micro-structure file");
    syncFilesInFs();
    return Promise.resolve();
}

function syncFilesInFs() {
    files = [];
    fs.readdirSync(filesPath).forEach(function(file,index){
            var curPath = filesPath + "/" + file;
            if(!fs.lstatSync(curPath).isDirectory()) { // recurse
                var f = {"name":file};
                files.push(f);
            }
    });


    return Promise.resolve();
}


function getFilesR(req, res, next) {

    syncFilesInFs()
    .then(function() {
        res.send(files);
    })
    .catch(function(err) {
        console.error(err, err.stack);
    })
}

function uploadFileR(req, res, next) {
    console.log("upload micro structure file r");
    var form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {

            var oldpath = files.file.path;
            var newpath = filesPath + "/" + files.file.name;

            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.sendStatus(200);
            });
        });
    }catch(err) {
        console.error(err, err.stack);
        next(err);
    }

}

function removeFileR(req, res, next) {

    var name = req.params.name;

    console.log("remove " + name);
    new Promise(function(resolve, reject) {
        fs.unlink(filesPath+"/" + name, function(err) {
            if (err) {
                console.error(err);
                reject(err);
            }
            else {
                resolve();
            }
        })
    })
    .then(function() {
        res.sendStatus(200);
    })
    .catch(function(err) {
        next(err);
        console.error(err, err.stack);
    });

}

module.exports = function(app) {

    init()
    .then(function() {
        app.get("/conf/microStrFiles", getFilesR);
        app.post("/conf/microStrFiles", uploadFileR);
        app.delete("/conf/microStrFiles/:name", removeFileR);
    })
    .catch(function(err) {
        console.error(err);
    });
}

