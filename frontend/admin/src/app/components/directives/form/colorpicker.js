/**
 * Created by abou on 02/06/17.
 */
(function () {
    'use strict';
    if (!angular || typeof angular == 'undefined')
        throw new Error('angular is missing');
    angular
        .module('AbouEventAdmin')
        .directive('abColorpicker', AbColorPicker);

    function AbColorPicker($mdUtil, $parse, $mdAria, inputDirective, $timeout) {

        function AbColorPickerCtrl($scope, $attrs) {
            this.scope = $scope;
            this.attrs = $attrs;
            this.disabled = false;
            this.available = [];
            this.color = null;
            this.mdInputContainer = null;
            this.ngModelCtrl = null;
            this.disabled = false;
            this.progress = false;
        }

        AbColorPickerCtrl.prototype.configureNgModel = function (ngModelCtrl, mdInputContainer, inputDirective) {
            this.ngModelCtrl = ngModelCtrl;
            this.mdInputContainer = mdInputContainer;

            inputDirective[0].link.pre(this.scope, {
                on: angular.noop,
                val: angular.noop,
                0: {}
            }, this.attrs, [ngModelCtrl]);

            var self = this;

            // Responds to external changes to the model value.
            self.ngModelCtrl.$formatters.push(function (value) {
                self.onExternalChange(value);
                return value;
            });

        };

        AbColorPickerCtrl.prototype.onExternalChange = function (value) {
            this.mdInputContainer && this.mdInputContainer.setHasValue(angular.isDefined(value));
            if (!angular.isDefined(value))
                return;

            this.color = value;
            this.refresh();
        };

        AbColorPickerCtrl.prototype.select = function (item) {
            if (angular.isUndefined(item))
                return;
            this.ngModelCtrl.$viewValue = item.hex;
            this.onExternalChange(item.hex);
            this.ngModelCtrl.$commitViewValue();

        };

        AbColorPickerCtrl.prototype.refresh = function () {
            var self = this;
            if (!angular.isArray(this.available) || !this.available.length > 0) {
                this.available = [];
                angular.forEach(this.scope.available, function (color) {
                    var selected = self.color && self.color == color,
                        height = (self.scope.available.length * 30) / 10;
                    this.push({
                        hex: color,
                        selected: selected,
                        style: {
                            "background-color": color,
                            "min-height": height + 'px'
                        }
                    });
                }, this.available);
            } else {
                angular.forEach(this.available, function (color, i) {
                    color.selected = self.color && self.color == color.hex;
                    this[i] = color;
                }, this.available);
            }

        };

        AbColorPickerCtrl.$inject = ['$scope', '$attrs'];

        return {
            template: '<div ng-if="!ctrl.disabled" layout="row" class="ab-colorpicker">' +
            '<span flex ng-click="ctrl.select(color)" ng-repeat="color in ctrl.available" class="color-item" ng-class="{selected:color.selected}" ng-style="color.style"></span>' +
            '</div>' +
            '<div ng-if="ctrl.disabled" layout="row" layout-align="start center" class="ab-colorpicker-disabled">' +
            '<span style="background-color: {{ctrl.color}};min-height: 50px;min-width:60px;margin: 5px"></span>' +
            '<span>{{ctrl.color}}</span>' +
            '</div>',
            scope: {
                available: '=?availableColors'
            },
            restrict: 'E',
            controller: AbColorPickerCtrl,
            controllerAs: 'ctrl',
            require: ['^?mdInputContainer', '?ngModel', '?^form', 'abColorpicker'],
            link: function (scope, elt, attr, ctrls) {

                if (angular.isDefined(scope.available) && !angular.isArray(scope.available))
                    throw new Error('available colors must be an array');
                else if (angular.isUndefined(scope.available))
                    scope.available = [];

                var containerCtrl = ctrls[0];
                var ngModel = ctrls[1] || $mdUtil.fakeNgModel();
                var formCtrl = ctrls[2];
                var mdNoAsterisk = $mdUtil.parseAttributeBoolean(attr.mdNoAsterisk);
                var myCtrl = ctrls[3];

                myCtrl.configureNgModel(ngModel, containerCtrl, inputDirective);

                if (attr['ngDisabled']) {
                    attr.$observe('disabled', function (v) {
                        myCtrl.disabled = v;
                    });
                }

                if (containerCtrl) {

                    var spacer = elt[0].querySelector('.md-errors-spacer');

                    if (spacer) {
                        elt.after(angular.element('<div>').append(spacer));
                    }

                    containerCtrl.setHasPlaceholder(attr.mdPlaceholder);
                    containerCtrl.input = elt;
                    containerCtrl.element
                        .addClass('_ab-colorpicker-floating-label');

                    if (!containerCtrl.label) {
                        $mdAria.expect(element, 'aria-label', attr.mdPlaceholder);
                    } else if (!mdNoAsterisk) {
                        attr.$observe('required', function (value) {
                            containerCtrl.label.toggleClass('md-required', !!value);
                        });
                    }

                    scope.$watch(containerCtrl.isErrorGetter || function () {
                            return ngModel.$invalid && (ngModel.$touched || (formCtrl && formCtrl.$submitted));
                        }, containerCtrl.setInvalid);
                }
            }
        }
    }

    AbColorPicker.$inject = ['$mdUtil', '$parse', '$mdAria', 'inputDirective', '$timeout'];
})();