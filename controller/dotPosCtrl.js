var _ = require('lodash');
var fs = require('fs');

var formidable = require('formidable');
var dotPosFilesPath = "./conf/dot_pos";
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

            var oldpath = files.file.path;
            var newpath = dotPosFilesPath + "/" + files.file.name;

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

function removeDotPosFileR(req, res, next) {

    var name = req.params.name;

    console.log("remove " + name);
    new Promise(function(resolve, reject) {
        fs.unlink(dotPosFilesPath+"/" + name, function(err) {
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
        app.get("/conf/dotPosFiles", getDotPosFilesR);
        app.post("/conf/dotPosFiles", uploadDotPosFileR);
        app.delete("/conf/dotPosFiles/:name", removeDotPosFileR);
    })
    .catch(function(err) {
        console.error(err);
    });
}

