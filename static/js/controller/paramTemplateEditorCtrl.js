'use strict'

var app = angular.module("mainApp");

app.controller("paramTemplateEditorCtrl",  function($scope, $http, aservice, backEndService){
    console.log("add paramTemplateEditorCtrl");
    $scope.parameters = 
    {
        "default":{},
        "names":["default", "t1", "t2"],
        "current": {
            "name":"default",
            "data":[]
        }
    }
    
    console.log($scope.parameters);

    $http.get('/conf/parameters/default').
        then(function(response) {
            $scope.parameters.default = response.data;
            $scope.parameters.current.data = response.data;
            console.log($scope.parameters);

        });

    $scope.save = function() {
        console.log($scope.parameters);
    }
});




