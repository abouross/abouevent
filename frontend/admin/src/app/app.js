'use strict';

angular.module('AbouEventAdmin', ['ngAnimate', 'ngCookies',
        'ngSanitize', 'ui.router', 'ngMaterial', 'nvd3', 'md.data.table', 'ngUpload', 'ngLocale'])

    .config(function ($mdThemingProvider, $httpProvider, $mdToastProvider, $mdDateLocaleProvider,
                      $localeProvider) {
        $mdDateLocaleProvider.months = $localeProvider.$get().DATETIME_FORMATS.MONTH;
        $mdDateLocaleProvider.shortMonths = $localeProvider.$get().DATETIME_FORMATS.SHORTMONTH;
        $mdDateLocaleProvider.days = $localeProvider.$get().DATETIME_FORMATS.DAY;
        $mdDateLocaleProvider.shortDays = $localeProvider.$get().DATETIME_FORMATS.SHORTDAY;

        $mdThemingProvider.theme('abouevent')
            .primaryPalette('grey', {
                'default': '600'
            })
            .accentPalette('teal', {
                'default': '600'
            })
            .warnPalette('red');

        $mdThemingProvider.setDefaultTheme('abouevent');

        $httpProvider.interceptors.push('RequestError');

        function ToastOptions(type, icon) {
            icon = angular.isDefined(icon) ? '<md-icon>' + icon + '</md-icon>' : '';
            return ["$mdToast", "$mdTheming", function ($mdToast, $mdTheming) {
                return {
                    template: '<md-toast md-theme="{{ toast.theme }}" class="' + type + '" ng-class="{\'md-capsule\': toast.capsule}">' +
                    '  <div class="md-toast-content">' +
                    '    ' + icon +
                    '    <span class="md-toast-text" role="alert" aria-relevant="all" aria-atomic="true">' +
                    '      {{ toast.content }}' +
                    '    </span>' +
                    '    <md-button class="md-action" ng-if="toast.action" ng-click="toast.resolve()" ' +
                    '        ng-class="highlightClasses">' +
                    '      {{ toast.action }}' +
                    '    </md-button>' +
                    '  </div>' +
                    '</md-toast>',
                    theme: $mdTheming.defaultTheme(),
                    controllerAs: 'toast',
                    bindToController: true,
                    controller: ["$scope", function mdToastCtrl($scope) {
                        var self = this;

                        if (self.highlightAction) {
                            $scope.highlightClasses = [
                                'md-highlight',
                                self.highlightClass
                            ]
                        }

                        this.resolve = function () {
                            $mdToast.hide(ACTION_RESOLVE);
                        };
                    }]
                };
            }]
        }

        $mdToastProvider.addPreset('success', {
            methods: ['textContent', 'content', 'action', 'highlightAction', 'highlightClass', 'theme', 'parent'],
            options: ToastOptions('success', 'check')
        });

        $mdToastProvider.addPreset('warning', {
            methods: ['textContent', 'content', 'action', 'highlightAction', 'highlightClass', 'theme', 'parent'],
            options: ToastOptions('warning', 'warning')
        });

        $mdToastProvider.addPreset('danger', {
            methods: ['textContent', 'content', 'action', 'highlightAction', 'highlightClass', 'theme', 'parent'],
            options: ToastOptions('danger', 'error')
        });
    })
    .run(['$rootScope', 'AppName',
        function ($rootScope, AppName) {

            /***** Title Setup *****/
            angular.element('#app-title').text(AppName);
            $rootScope.$on('$stateChangeSuccess',
                function (event, toState, toParams, fromState, fromParams) {
                    angular.element(document)
                        .find('title')
                        .text((toState.data.title ? toState.data.title : 'Admin') + ' - ' + AppName);

                })
        }]);
