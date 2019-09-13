/**
 * Created by abou on 11/06/17.
 */
(function () {
    'use strict';
    angular.module('AbouEventAdmin')
        .directive('abState', StateDirective);

    function StateDirective($abresource) {
        return {
            restrict: 'E',
            template: '<md-card class="ab-state" ng-style="style">' +
            '<div layout="row" layout-align="start center">' +
            '<md-icon ng-if="icon" style="color: #fff" class="md-48" flex>{{icon}}</md-icon>' +
            '<div layout="column" flex layout-align="start top">' +
            '<p ng-if="text">{{text}}</p>' +
            '<md-progress-linear ng-if="progress"></md-progress-linear>' +
            '<strong>{{count}}</strong>' +
            '</div>' +
            '</div>' +
            '</md-card>',
            scope: {
                model: '=model',
                params: '=params',
                icon: '@icon',
                text: '@text',
                style: '=abStyle'
            },
            link: function (scope, elt, attrs) {
                if (angular.isString(scope.model))
                    scope.model = $abresource(scope.model);
                if (!scope.model || !angular.isFunction(scope.model.count)) {
                    throw 'Please give model who implement count';
                }

                scope.progress = scope.model.count(scope.params)
                    .then(function (response) {
                        scope.count = response.data.count;
                    }).finally(function(){
                        scope.progress = null;
                    });
            }
        }
    }

    StateDirective.$inject = ['$abresource'];

})();
