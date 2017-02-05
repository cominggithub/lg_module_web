
console.log("start angular app");


var app=angular.module("mainApp", ["ngRoute"]);

console.log("set app onfig");
app.aa = "mainApp";

console.log(app.aa);
app.config(['$routeProvider', function($routeProvider) {
    console.log("route provider");
    $routeProvider
    .when("/taskHistory", {
        templateUrl: "taskHistory.html"
    })
    .when("/modal", {
        templateUrl: "modal.html"
    })
    .when("/newTask", {
        templateUrl: "newTask.html"
    });

}]);

