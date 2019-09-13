/**
 * Created by abou on 12/06/17.
 */
(function () {
    'use strict';

    angular.module('AbouEventAdmin')
        .directive('panelWidget', function () {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                scope: {title: '@', template: '@', options: '@'},
                template: '' +
                '<section layout-margin class="md-whiteframe-z1 panel-widget">' +
                '  <md-toolbar md-theme="custom" class="md-hue-1 panel-widget-toolbar">' +
                '    <div class="md-toolbar-tools">' +
                '      <h3 class="panel-widget-tittle">{{title}}</h3>' +
                '      <span flex></span>' +
                '      <md-button ng-if="options" ng-click="toggle()" class="md-icon-button" aria-label="Show options">' +
                '        <i class="material-icons">more_vert</i>' +
                '      </md-button>' +
                '    </div>' +
                '  </md-toolbar>' +
                '  <div ng-include="template"/>' +
                '</section>',
                compile: function (element, attrs, linker) {
                    return function (scope, element) {
                        scope.$showOptions = false;
                        scope.toggle = function(){
                            scope.$showOptions = !scope.$showOptions;
                        };

                        linker(scope, function (clone) {
                            element.append(clone);
                        });
                    };
                }
            };
        });

})();