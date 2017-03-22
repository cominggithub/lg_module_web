'use strict'

var app = angular.module("mainApp");
var http;

app.controller("paramTemplateEditorCtrl",  function($scope, $http, aservice, backEndService){
    console.log("add paramTemplateEditorCtrl");
    $scope.parameters =
    {
        "default":{},
        "current": {
            "name":"default",
            "data":[]
        }
    }

    console.log($scope.parameters);

    http = $http;
    $http.get('/conf/parameters/templates').
        then(function(response) {

            console.log("GGGGGGGGGGG");
            $scope.parameters.templates = response.data;
            $scope.parameters.selected = $scope.parameters.templates[0];
            $scope.parameters.default = $scope.parameters.templates[0];

            for(var i=1; i<$scope.parameters.templates.length; i++) {
                diffTemplate($scope.parameters.templates[0], $scope.parameters.templates[i]);
            }
        });

    $scope.save = function() {
        saveTemplate($scope.parameters.selected);
    }

    $scope.newTemplate = function() {
        console.log($scope.newTemplateName);
        var newTemplate = copyTemplate($scope.parameters.templates[0], $scope.newTemplateName);
        $scope.parameters.templates.push(newTemplate);
        $scope.parameters.selected = newTemplate;
        console.log($scope.parameters.templates);
    }

    $scope.parameter_changed = function() {
        diffTemplate($scope.parameters.templates[0], $scope.parameters.selected);
    }
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



