angular.module('fileDrop', ['fileReader'])
.directive('fileDrop', ['$parse', function($parse) {
    return {
        restrict:'EA',
        link: function(scope, element, attrs) {
            var onDragOver = function (e) {
                e.preventDefault();
                element.addClass("drag-over");
            };

            var onDragEnd = function (e) {
                e.preventDefault();
                element.removeClass("drag-over");
            };

            var modelGet = $parse(attrs.fileDrop);
            var modelSet = modelGet.assign;
            var onDrop = $parse(attrs.onDrop);

            var updateModel = function () {
                scope.$apply(function () {
                    modelSet(scope, element[0].files[0]);
                    onDrop(scope);
                });
            };
            //element.bind('change', updateModel);
            element.bind("dragover", onDragOver)
                   .bind("dragleave", onDragEnd)
                   .bind("drop", function (e) {
                       onDragEnd(e);
                       scope.$apply(function () {
                            console.log("drop: ", e.originalEvent.dataTransfer.files[0]);
                            modelSet(scope, e.originalEvent.dataTransfer.files[0]);
                            onDrop(scope);
                        });
                       //loadFile(e.originalEvent.dataTransfer.files[0]);
                   });
        }
    };
}]);
