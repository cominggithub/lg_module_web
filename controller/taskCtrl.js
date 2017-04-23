'use strict'

var _ = require('lodash');
var fs = require('fs');
var proc = require('child_process');
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
        })
        .then(function() {

            tasks.sort(function(a,b) {return a.name < b.name});
            return Promise.resolve();
        });
}

function readFile(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf-8', function(err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        })
    })
}

function writeToFile(path, data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(path, data, function(err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}

function loadPid(task, path) {

    if (typeof task.pid === 'undefined') {
        task.pid = {};
        task.pid.bash = undefined;
        task.pid.rayHandlers = undefined;
    }

    return readFile(path+"bash.pid")
    .then(function(bashPid) {
        task.pid.bash = bashPid.replace("\n", "");
        return readFile(path+"ray_handler.pid");
    })
    .then(function(rayHandlerPids) {
        task.pid.rayHandlers = rayHandlerPids.match(/[^\r\n]+/g);
        return Promise.resolve();
    })
    .catch(function(err) {
        //console.error(err, err.stack);
    });
}

function isPidAlive(pid) {
    return isRunning(pid);
}

function taskPath(taskName) {
    return historyFolder+"/"+taskName;
}

function handleErrorTask(task) {
    console.log("handle error task " + task.name + ", " + task.status );
    task.status = "error";
    stopTask(task)
    .then(function() {
        return writeToFile(taskPath(task.name)+"/status", task.status);
    })
    .catch(function(err) {
        //console.error(err, err.stack);
    });
}

function updateStatus(task) {
    var path = "./tasks/history/"+task.name + "/";
    return readFile(path + "status")
    .then(function(status) {
        task.status = status.replace("\n", "");
        if (task.status === 'in execution') {
            if (!isPidAlive(task.pid.bash)) {
                return handleErrorTask(task);
            }
        }
        return Promise.resolve();
    })
    .catch(function(err) {
        //console.error(err, err.stack);
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
    t.optRecordDatUrl = "/tasks/history/"+t.name + "/output.opt_record.dat";
    t.optRecordTxtUrl = "/tasks/history/"+t.name + "/output.opt_record.txt";
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
    console.log("./bin/run_mac_multi.sh " + "-p " + "-output=" + task.outputFolder + " -param=./conf/parameters/"+task.parametersFile + " -n="+task.processCnt);
    var p = proc.execFile("./bin/run_mac_multi.sh", ["-p", "-output="+task.outputFolder, "-param=./conf/parameters/"+task.parametersFile, "-n="+task.processCnt]);
    p.stdout.on('data', function(data) {
        console.log(data.toString());
    });


    return Promise.resolve(task);
}

function getTask(name) {
    return _.find(tasks, {"name":name});
}

function removeFolderR(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                removeFolderR(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        console.log("rm " + path);
        var result = fs.rmdirSync(path);
        console.log(result);
    }
}

function getTaskPids(task) {
    var pids = [];
    if (typeof task.pid.bash !== 'undefined') {
        pids.push(task.pid.bash);
    }
    _.each(task.pid.rayHandlers, function(pid) {

        pids.push(pid);
    });

    return pids;

}
function removeTaskFolder(taskName) {
    console.log("remove folder " + historyFolder+"/"+taskName);
    removeFolderR(historyFolder+"/"+taskName);
}

function removeTask(task) {
    stopTask(task);
    removeTaskFolder(task.name);
}


function stopTask(task) {
    var pids = getTaskPids(task);
    _.each(pids, function(pid) {
        if (isRunning(pid)) {
            process.kill(pid);
        }
    });

    return Promise.resolve();
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
    var task = getTask(req.params.taskName);
    removeTask(task);
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

