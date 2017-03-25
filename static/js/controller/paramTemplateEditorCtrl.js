'use strict'

var app = angular.module("mainApp");
var http;
var scope;

app.controller("paramTemplateEditorCtrl",  function($scope, $http, aservice, backEndService){
    console.log("add paramTemplateEditorCtrl");
    scope = $scope;
    console.log(scope);
    console.log($scope);
    http = $http;
    $scope.parameters =
    {
        "default":{},
        "current": {
            "name":"default",
            "data":[]
        }
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
        saveTemplate($scope.parameters.selected);
    }

    $scope.newTemplate = function() {
        console.log($scope.newTemplateName);
        var newTemplate = copyTemplate($scope.parameters.templates[0], $scope.newTemplateName);
        $scope.parameters.templates.push(newTemplate);
        $scope.parameters.selected = newTemplate;
        $scope.save();
        console.log($scope.parameters.templates);
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

    $scope.parameter_changed = function() {
        diffTemplate($scope.parameters.templates[0], $scope.parameters.selected);
    }

    $scope.loadTemplates();
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
