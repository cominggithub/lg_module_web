'use strict'
var app = angular.module("mainApp");
app.controller('dotPosCtrl', function($scope, $http, FileUploader) {
    console.log("add dotPosCtrl");

    var uploader = $scope.uploader = new FileUploader({
            url: '/conf/dotPosFiles'
        });

    uploader.filters.push({
        name: 'syncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            console.log('syncFilter');
            return this.queue.length < 10;
        }
    });

    // an async filter
    uploader.filters.push({
        name: 'asyncFilter',
        fn: function(item /*{File|FileLikeObject}*/, options, deferred) {
            console.log('asyncFilter');
            setTimeout(deferred.resolve, 1e3);
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
        $scope.loadDotPosFiles();
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    $scope.dotPosFiles = {
        "files":
        [
            {"name": "a.txt"},
            {"name":"b.txt"},
            {"name":"c.txt"}
        ]
    }

    $scope.dotPosFiles.selected = $scope.dotPosFiles.files[0];

    $scope.loadDotPosFiles = function() {
        console.log("GGGG");
        $http.get('/conf/dotPosFiles').
            then(function(res) {
                $scope.dotPosFiles.files = res.data;
                $scope.dotPosFiles.selected = $scope.dotPosFiles.files[0];
                console.log($scope.dotPosFiles.files[0].name);
        });

    }

    $scope.loadDotPosFiles();
});
