/**
 * Created by abou on 17/05/17.
 */
(function () {
    'use strict';

    angular
        .module('AbouEventAdmin')
        .directive('abProgress', abProgressDirective);

    function abProgressDirective($compile) {
        return {
            restrict: 'A',
            scope: {
                progress: '=abProgress'
            },
            compile: function (element, attrs) {
                var showProgress = angular.isDefined(attrs.abProgressShow);
                var html = '<div class="ab-progress">';
                if (showProgress)
                    html += '<md-progress-linear md-mode="indeterminate"></md-progress-linear>';
                html += '</div>';
                element.addClass('ab-progress-container');
                element.prepend(html);
                return {
                    pre: function (scope, element, attrs) {
                        if(!scope.progress || !angular.isObject(scope.progress)){
                            var progressElt = element.find('md-progress-linear');
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
                            var progressElt = element.find('md-progress-linear');
                            element.addClass('active');
                            if (progressElt.length > 0)
                                $compile(progressElt.attr('ng-disabled', 'false'))(scope);
                            progress
                                .finally(function () {
                                    var progressElt = element.find('md-progress-linear');
                                    if (progressElt.length > 0) {
                                        $compile(progressElt.attr('ng-disabled', 'true'))(scope);
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

    abProgressDirective.$inject = ['$compile'];
})();