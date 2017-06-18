'use strict'

var app = angular.module("mainApp");
var http;
var scope;

app.controller("paramTemplateEditorCtrl",  function($scope, $http, aservice, backEndService){
    scope = $scope;
    http = $http;
    $scope.parameters =
    {
        "default":{},
        "current": {
            "name":"default",
            "data":[]
        }
    }

    $scope.dotPosFiles = {
        "files":
        [
            {"name": "a.txt"},
            {"name":"b.txt"},
            {"name":"c.txt"}
        ]
    }

    $scope.microStrFiles = {
        "files":
        [
            {"name": "microStr1.txt"},
            {"name": "microStr2.txt"},
        ]
    }


    $scope.dotPosFiles.selected = $scope.dotPosFiles.files[0];
    $scope.microStrFiles.selected = $scope.microStrFiles.files[0];

    $scope.loadDotPosFiles = function() {
        $http.get('/conf/dotPosFiles').
            then(function(res) {
                $scope.dotPosFiles.files = res.data;
                $scope.dotPosFiles.selected = $scope.dotPosFiles.files[0];
        });

    }
    $scope.loadMicroStrFiles = function() {
        $http.get('/conf/microStrFiles').
            then(function(res) {
                $scope.microStrFiles.files = res.data;
                $scope.microStrFiles.selected = $scope.microStrFiles.files[0];
        });

    }


    $scope.loadTemplates = function() {
        $http.get('/conf/parameters/templates').
            then(function(res) {
                $scope.parameters.templates = res.data;
                $scope.parameters.selected = $scope.parameters.templates[0];
                $scope.parameters.default = $scope.parameters.templates[0];

                for(var i=1; i<$scope.parameters.templates.length; i++) {
                    diffTemplate(scope.parameters.templates[0], scope.parameters.templates[i]);
                }
        });
    }


    $scope.save = function() {
        $scope.parameters.selected["dot_pos_file"] = $scope.dotPosFiles.selected.name;
        $scope.parameters.selected["str_file"] = $scope.microStrFiles.selected.name;
        saveTemplate($scope.parameters.selected);
    }

    $scope.newTemplate = function() {
        var newTemplate = copyTemplate($scope.parameters.templates[0], $scope.newTemplateName);
        $scope.dotPosFiles.selected = $scope.dotPosFiles.files[0];
        $scope.microStrFiles.selected = $scope.microStrFiles.files[0];
        $scope.parameters.templates.push(newTemplate);
        $scope.parameters.selected = newTemplate;
        $scope.save();
    }

    $scope.remove = function() {
        removeTemplate($scope.parameters.selected);
        var match = _.find($scope.parameters.templates, function(t) { return t.name === $scope.parameters.selected.name});
        if (match) {
            var index = $scope.parameters.templates.indexOf(match);
            $scope.parameters.templates.splice(index, 1);
        }
        $scope.loadTemplates();
    }

    $scope.parameterChanged = function() {
        diffTemplate($scope.parameters.templates[0], $scope.parameters.selected);
    }

    $scope.loadTemplates();
    $scope.loadDotPosFiles();
});


function copyTemplate(srcTemplate, templateName) {
    console.log("copy template");
    var newTemplate = angular.copy(srcTemplate);
    newTemplate.name = templateName;
    newTemplate["file_name"] = templateName.replace(/ /g,'') + ".parameters.txt";
    return newTemplate;
}

function diffTemplate(srcTemplate, modifiedTemplate) {
    for(var i=0; i<srcTemplate.data.length; i++) {
        modifiedTemplate.data[i].modified = modifiedTemplate.data[i].value !== srcTemplate.data[i].value;
    }
}

function saveTemplate(template) {
    http.put('/conf/parameters/templates/'+template.name, template)
    .then(function(res) {
        console.log(res);
    })
    .catch(function(err) {
        console.error(err, err.stack);
    })

}

function removeTemplate(template) {
    http.delete('/conf/parameters/templates/'+template.name)
    .then(function(res) {
        console.log(res);
    })
    .catch(function(err) {
        console.error(err, err.stack);
    })

}
