'use strict'

var _ = require('lodash');
var fs = require('fs');
var moment = require('moment');
var runningTaskFolder = "./tasks/running";
var historyFolder = "./tasks/history";

var tasks = [];
var taskSeq = 1;

function syncTasksInFS() {
    console.log("sync task folders");
    return new Promise(function(resolve, reject) {
        fs.readdir(historyFolder, function(err, folders) {
            console.log(historyFolder);
            if (err) {
                console.error(err, err.stack);
                reject(err);
            }
            else {
                console.log(folders);
                _.each(folders, function(folder) {
                    loadTask(folder);
                });
                resolve(tasks);
            }
        })
    });
}


function loadTask(folder) {
    var t = {};
    t.no = taskSeq++;
    t.name = folder;
    t.startTime = moment.now();
    t.status = "finished";
    t.pid = 1123;
    t.processCnt = 2;
    t.executionMode = "seq";
    t.parametersUrl = "aaa.pdf";
    t.optRecordUrl = "bbb.pdf"
    tasks.push(t);
}


function addTask() {

}

function init() {
    console.log("taskCtrl init");
    return syncTasksInFS();
}

function getTasksR(req, res, next) {
    console.log("get tasks");
    res.send(tasks);
}

function newTaskR(req, res, next) {

    console.log("new task");
    addTask()
    .then(function(task) {
        res.send(task);
        res.sendStatus(200);

    })
    .catch(function(err) {
        next(err);
        console.error(err, err.stack);
    });
}

function stopTaskR(req, res, next) {
    console.log("task task " + req.param.taskId);
    res.sendStatus(200);
}

function removeTaskR(req, res, next) {

    console.log("remote task " + req.param.taskId);
    res.sendStatus(200);
}


module.exports = function(app) {

    init()
    .then(function() {
        app.get("/tasks", getTasksR);
        app.put("/tasks", newTaskR);
        app.get("/tasks/:taskId/stop", stopTaskR);
        app.delete("/tasks/:taskId", removeTaskR);
    })
    .catch(function(err) {
        console.error(err);
    });
}

