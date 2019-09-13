/**
 * Created by abou on 17/05/17.
 */
(function () {
    'use strict';

    angular
        .module('AbouEventAdmin')
        .directive('abImgProgress', abImgProgressDirective);

    function abImgProgressDirective($compile) {
        return {
            restrict: 'A',
            scope: {
                progress: '=abImgProgress'
            },
            compile: function (element, attrs) {
                var html = '<div class="ab-img-progress">';
                html += '<md-progress-circular md-mode="indeterminate"></md-progress-circular>';
                html += '</div>';
                element.addClass('ab-img-progress-container');
                element.prepend(html);
                return {
                    pre: function (scope, element, attrs) {
                        if (!scope.progress || !angular.isObject(scope.progress)) {
                            var progressElt = element.find('md-progress-circular');
                            if (progressElt.length > 0) {
                                $compile(progressElt.attr('ng-disabled', 'true'))(scope);
                            }
                            element.removeClass('active');
                            return;
                        }
                        scope.$watch('progress', function (progress) {
                            if (!progress) {
                                return;
                            }
                            if (progress.$$state.status != 0)
                                return;
                            var progressElt = element.find('md-progress-circular');
                            element.addClass('active');
                            if (progressElt.length > 0)
                                $compile(progressElt.attr('ng-disabled', 'false'))(scope);
                            else
                                element
                                    .find('.ab-img-progress')
                                    .prepend('<md-progress-circular md-mode="indeterminate"></md-progress-circular>');
                            progress
                                .finally(function () {
                                    var progressElt = element.find('md-progress-circular');
                                    if (progressElt.length > 0) {
                                        $compile(progressElt.attr('ng-disabled', 'true'))(scope);
                                        progressElt.remove();
                                    }
                                    element.removeClass('active');
                                });
                        });
                    }
                }
            }
        }
            ;
    }

    abImgProgressDirective.$inject = ['$compile'];
})();