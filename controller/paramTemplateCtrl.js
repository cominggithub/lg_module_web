'use strict'

var _ = require('lodash');
var fs = require('fs');
var templateConf = "./conf/parameters/parameters.template.conf";
var templatePath = "./conf/parameters/";
var parameters = [];
var templates = [];



function init() {
    return loadFileList()
    .then(function() {
        return loadTemplates();
    })
    .catch(function(err) {
        console.error(err, err.stack);
    });
}

function loadFileList() {
    return new Promise(function(resolve, reject) {
        fs.readFile(templateConf, 'utf-8', function(err, data) {
            if (err) throw err;

            //console.log(data);
            templates = JSON.parse(data);
            resolve(templates);
        })
    });
}


function loadTemplates() {
    var pp = _.map(templates, function(t) {
        console.log("load " + t.name + ", " +t.file_name);
        return loadTemplate(t);

    });

    return Promise.all(pp);

}
function loadTemplate(template) {

	return new Promise(function(resolve, reject) {
		fs.readFile(templatePath + template["file_name"], 'utf8', function(err, data) {
			if (err) {
                reject(err);
            }
            else {

    			var lines = data.split(/\r?\n/);
    			template.data = [];
    			_.each(lines, function(line) {
    				line = line.trim();
    				if(!line.startsWith("#") && !line.startsWith("//") && line.indexOf("=") > -1) {
    					var n = line.split("=")[0].trim();
    					var v = line.split("=")[1].trim();
    					template.data.push(
    						{
    							"name":n,
    							"value":v
    						}
    					);
    				}
    				else {
                        //console.log("skip ", line);
    				}

	    		});
    			resolve(template.data);
            }
		});
	});

}

function ok(req, res, next) {
	res.send("ok");
}


function getTemplates(req, res, next) {
    console.log("get templates");
    console.log(templates);
    res.send(templates);
}

module.exports = function (app) {
	init()
	.then(function()
	{
		app.get("/ok", ok);
		app.get("/conf/parameters/templates", getTemplates);
	})
	.catch(function(err) {
		console.log("GGGGGGGGGGG");
		console.error(err);
	});
};
