var _ = require('lodash');
var fs = require('fs');

var dotPosFilesPath = "./conf/dot_pos_files";
var files = [];

function init() {
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

module.exports = function(app) {

    init()
    .then(function() {
        app.get("/conf/dotPosFiles", getDotPosFilesR);
    })
    .catch(function(err) {
        console.error(err);
    });
}

