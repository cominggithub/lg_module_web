'use strict'

var _ = require('lodash');
var fs = require('fs');
var process = require('child_process');
var moment = require('moment');
var isRunning = require('is-running');
var runningTaskFolder = "./tasks/running";
var historyFolder = "./tasks/history";

var tasks = [];
var taskSeq = 1;


function getTaskFolders() {

    return new Promise(function(resolve, reject) {
        fs.readdir(historyFolder, function(err, folders) {
            if (err) {
                console.error(err, err.stack);
                reject(err);
            }
            else {
                folders.sort();
                resolve(folders);
            }
        })
    });
}

function syncTasksInFS() {
    tasks = [];
    return getTaskFolders()
        .then(function(folders) {
            var pp = _.map(folders, function(folder) {
                return loadTask(folder);
            });
            return Promise.all(pp);
        });
}

function readFile(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf-8', function(err, data) {
            if (err) {
                console.error(err, err.stack);
                reject(err);
            }
            else {
                resolve(data);
            }
        })
    })
}

function loadPid(task, path) {

    return readFile(path+"bash.pid")
    .then(function(bashPid) {
        if (typeof task.pid === 'undefined') {
            task.pid = {};
        }

        task.pid.bash = bashPid.replace("\n", "");
        return readFile(path+"ray_handler.pid");
    })
    .then(function(rayHandlerPids) {
        task.pid.rayHandlers = rayHandlerPids.match(/[^\r\n]+/g);
        return Promise.resolve();
    })
    .catch(function(err) {
        console.error(err, err.stack);
    });
}

function updateStatus(task) {
    var path = "./tasks/history/"+task.name + "/";
    return readFile(path + "status")
    .then(function(status) {
        task.status = status.replace("\n", "");
        return Promise.resolve();
    })
    .catch(function(err) {
        console.error(err, err.stack);
    })
}

function loadTask(folder) {
    var t = {};
    var path = "./tasks/history/"+folder + "/";
    t.no = taskSeq++;
    t.name = folder;
    t.startTime = moment.now();
    t.processCnt = 2;
    t.executionMode = "seq";
    t.parametersUrl = "/tasks/history/"+t.name + "/parameters.txt";
    t.optRecordUrl = "/tasks/history/"+t.name + "/output.opt_record.txt";
    t.status = "not updated";
    return loadPid(t, path)
    .then(function() {
        return updateStatus(t);
    })
    .then(function() {
        tasks.unshift(t);
        return Promise.resolve();
    })
}



function init() {
    return syncTasksInFS();
}

function getTasksR(req, res, next) {

    syncTasksInFS()
    .then(function() {
        res.send(tasks);
    })
    .catch(function(err) {
        console.error(err, err.stack);
    })
}

function addTask(task) {
    var name = moment().format("YYYY_MM_DD_HH_mm_ss");
    var outputFolder;
    task.name = moment().format("YYYY_MM_DD_HH_mm_ss");
    task.outputFolder = "./tasks/history/"+task.name;
    var p = process.execFile("./bin/run_mac_multi.sh", ["-p", "-output="+task.outputFolder, "-param=./conf/parameters/"+task.parametersFile, "-n="+task.processCnt]);
    p.stdout.on('data', function(data) {
        console.log(data.toString());
    });


    return Promise.resolve(task);
}

function removeFolderR(path) {
    var deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
                var curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };
}

function getTaskPids(taskName) {

    return undefined;
}
function removeTaskFolder(taskName) {
    removeFolderR(historyFolder+"/"+taskName);
}

function removeTask(taskName) {
    stopTask(taskName);
//    removeTaskFolder(taskName);
}


function stopTask(taskName) {
    var pids = getTaskPids(taskName);
    _.each(pids, function(pid) {
        process.kill(pid);
    });
}
function newTaskR(req, res, next) {

    console.log("new task");
    addTask(req.body)
    .then(function(task) {
        return loadTask(task.name);
    })
    .then(function(task) {
        res.send(task);
    })
    .catch(function(err) {
        next(err);
        console.error(err, err.stack);
    });
}

function stopTaskR(req, res, next) {
    console.log("task task " + req.params.taskName);
    stopTask(req.params.taskName);
    res.sendStatus(200);
}

function removeTaskR(req, res, next) {
    console.log("remove task " + req.params.taskName);
    removeTask(req.params.taskName);
    res.sendStatus(200);
}


module.exports = function(app) {

    init()
    .then(function() {
        app.get("/tasks", getTasksR);
        app.put("/tasks", newTaskR);
        app.get("/tasks/:taskId/stop", stopTaskR);
        app.delete("/tasks/:taskName", removeTaskR);
    })
    .catch(function(err) {
        console.error(err);
    });
}

