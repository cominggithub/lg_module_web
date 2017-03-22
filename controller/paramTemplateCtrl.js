'use strict'

var _ = require('lodash');
var fs = require('fs');
var templateConf = "./conf/parameters/parameters.template.conf";
var templatePath = "./conf/parameters/";
var parameters = [];
var templates = [];



function init() {
    return loadFileList()
    .then(function(confData) {
        _.each(confData, function(c) {

            templates.push(c);
        });
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

            resolve(JSON.parse(data));
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
    							"value":v,
                                "modified":false
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
    res.send(templates);
}


function saveTemplateToFile(template) {
    var data = "";
    console.log("save template");
    console.log(template.name);
    console.log(template.file_name);
    _.each(template.data, function(entry) {
        data += entry.name + "=" + entry.value + "\n";
    });

    return new Promise(function(resolve, reject) {
        console.log("write to file " + templatePath + template["file_name"]);
        console.log(data);
		fs.writeFile(templatePath + template["file_name"], data, function(err) {
			if (err) {
                reject(err);
            }
            else {
    			resolve();
            }
		});
	});
}

function updateTemplateConf() {

    var conf;
    conf = _.map(templates, function(t) {
        return {"name":t.name, "file_name":t.file_name};
    });
    console.log("update template conf");
    console.log(conf);
    return new Promise(function(resolve, reject) {
        fs.writeFile(templateConf, JSON.stringify(conf), function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}
function saveTemplate(req, res, next) {
    console.log(req.params);
    console.log(req.body);
    var template = req.body;
    var match = _.find(templates, function(t) { return t.name === template.name});

    if (match) {
        _.merge(match, template);
    }
    else {
        match = template;
        templates.push(template);
    }

    saveTemplateToFile(match)
    .then(function(){
        return updateTemplateConf();
    })
    .then(function() {
        res.sendStatus(200);
    })
    .catch(function(err) {
        next(err);
        console.error(err, err.stack);
    });
}

module.exports = function (app) {
	init()
	.then(function()
	{
		app.get("/ok", ok);
		app.get("/conf/parameters/templates", getTemplates);
        app.put("/conf/parameters/templates/:tname", saveTemplate);
        app.post("/conf/parameters/templates/:tname", saveTemplate);
	})
	.catch(function(err) {
		console.log("GGGGGGGGGGG");
		console.error(err);
	});
};
