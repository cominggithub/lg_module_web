
console.log("start angular app");

var app=angular.module("mainApp", ["ngRoute"]);


app.config(['$routeProvider', function($routeProvider) {
    console.log("route provider");
    $routeProvider
    .when("/taskHistory", {
        templateUrl: "taskHistory.html"
    });

}]);

app.controller("taskHistoryController", function($scope){
    console.log("GG");
    $scope.taskHistory = [
        {
            no: "1",
            name:"task1",
            parameters: "parameters",
            log: "log",
            status: "success",
            date: "2017/1/5 11:22:33"
        },
        {
            no: "2",
            name:"task2",
            parameters: "parameters",
            log: "log",
            status: "failed",
            date: "2017/1/5 11:22:33"
        }
    ];
});

