/**
 * Created by abou on 17/05/17.
 */
(function () {
    'use strict';

    angular
        .module('AbouEventAdmin')
        .directive('abCountrySelect', abCountrySelect)
        .directive('abCountry', abCountry);

    function abCountrySelect(AbRegion) {
        return {
            restrict: 'E',
            scope: {
                lang: '@'
            },
            require: ['?ngModel', '?^form'],
            template: '<md-autocomplete placeholder="Selectionner un pays" ' +
            'md-selected-item="selectedCountry" md-search-text="searchText" ' +
            'md-no-cache="disableCaching" md-items="item in querySearch(searchText)"' +
            'md-item-text="item.name"> <span md-highlight-text="searchText">{{item.name}}</span> ' +
            '</md-autocomplete>',
            controller: abCountrySelectCtrl
        };
        function abCountrySelectCtrl($scope, $q) {
            $scope.countries = [];
            $scope.searchText = null;
            $scope.selectedCountry = null;
            $scope.disableCaching = true;
            $scope.lang = angular.isString($scope.lang) ? $scope.lang.toLowerCase() : 'fr';
            AbRegion.getCountryNames($scope.lang)
                .then(function (countries) {
                    $scope.countries = countries;
                    $scope.querySearch = querySearch;
                });
            function querySearch(query) {
                var results = query ? filter(query, $scope.countries) : [],
                    deferred;
                deferred = $q.defer();
                deferred.resolve(results);
                return deferred.promise;
            }

            function filter(query, object) {
                var result = [];
                angular.forEach(object, function (item, key) {
                    var lowercaseQuery = angular.lowercase(query),
                        lowercaseitem = angular.isString(item) ? angular.lowercase(item) : null;
                    if (lowercaseitem != null && lowercaseitem.indexOf(lowercaseQuery) != -1)
                        result.push({name: item, code: key});
                }, result);
                return result;
            }
        }

        abCountrySelectCtrl.$inject = ['$scope', '$q']
    }

    abCountrySelect.$inject = ['AbRegion'];

    function abCountry(AbRegion) {
        return {
            restrict: 'E',
            scope: {
                code: '=abCountryCode',
                local: '@abDisplayLocal'
            },
            template: '{{countryName}}',
            link: function (scope, elt, attrs) {
                if (angular.isUndefined(scope.code) || scope.code == '')
                    throw new Error('ab-country require ab-country-code attribute');
                var code = angular.isString(scope.code) ? scope.code.toUpperCase() : scope.code,
                    local = angular.isString(scope.local) ? scope.local.toLowerCase() : 'fr';
                AbRegion.getCountryName(code, local)
                    .then(function (name) {
                        scope.countryName = name;
                    });
            }
        }
    }

    abCountry.$inject = ['AbRegion'];

})();