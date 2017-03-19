'use strict'

var app = angular.module("mainApp");

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

    $http.get('/conf/parameters/templates').
        then(function(response) {

            console.log("GGGGGGGGGGG");
            $scope.parameters.templates = response.data;
            $scope.parameters.selected = $scope.parameters.templates[0];
            $scope.parameters.default = $scope.parameters.templates[0];
        });

    $scope.save = function() {
        $scope.parameters.selected = $scope.parameters.templates[0];
        console.log($scope.parameters.selected.name);
        console.log($scope.parameters.selected.data[0].value);
    }

    $scope.newTemplate = function() {
        console.log($scope.newTemplateName);
        var newTemplate = copyTemplate($scope.parameters.templates[0], $scope.newTemplateName);
        $scope.parameters.templates.push(newTemplate);
        $scope.parameters.selected = newTemplate;
        console.log($scope.parameters.templates);
    }
});


function copyTemplate(srcTemplate, templateName) {
    console.log("copy template");
    var newTemplate = angular.copy(srcTemplate);
    newTemplate.name = templateName;
    newTemplate["file_name"] = templateName.replace(/ /g,'');
    return newTemplate;
}





