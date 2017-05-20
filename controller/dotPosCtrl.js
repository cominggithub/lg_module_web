var _ = require('lodash');
var fs = require('fs');

var formidable = require('formidable');
var dotPosFilesPath = "./conf/dot_pos_files";
var files = [];

function init() {
    console.log("get dot pos file");
    syncDotPosFilesInFs();
    return Promise.resolve();
}

function syncDotPosFilesInFs() {
    files = [];
    fs.readdirSync(dotPosFilesPath).forEach(function(file,index){
            var curPath = dotPosFilesPath + "/" + file;
            if(!fs.lstatSync(curPath).isDirectory()) { // recurse
                console.log("dot pos file: " + file);
                var f = {"name":file};
                files.push(f);
            }
    });

    return Promise.resolve();
}


function getDotPosFilesR(req, res, next) {

    syncDotPosFilesInFs()
    .then(function() {
        res.send(files);
    })
    .catch(function(err) {
        console.error(err, err.stack);
    })
}

function uploadDotPosFileR(req, res, next) {
    console.log("upload dot pos file r");
    var form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {

            console.log(files);
            console.log(fields);
            var oldpath = files.file.path;
            var newpath = dotPosFilesPath + "/" + files.file.name;

            console.log(oldpath);
            console.log(newpath);
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

module.exports = function(app) {

    init()
    .then(function() {
        app.get("/conf/dotPosFiles", getDotPosFilesR);
        app.post("/conf/dotPosFiles", uploadDotPosFileR);
    })
    .catch(function(err) {
        console.error(err);
    });
}

