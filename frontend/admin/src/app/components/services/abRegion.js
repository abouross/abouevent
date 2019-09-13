/**
 * Created by abou on 20/05/17.
 */
(function () {
    'use strict';

    angular
        .module('AbouEventAdmin')
        .factory('AbRegion', AbRegion);

    AbRegion.$inject = ['$q', '$http'];

    function AbRegion($q, $http) {
        function Region(url) {
            this.cache = {};
            this.url = url;
            this.loadLocaleData = function (local) {
                local = local || 'fr';
                var defer = $q.defer();
                if (local == '')
                    defer.reject({'message': 'Empty local'});
                var that = this;
                $http.get(url + '/' + local + '.json')
                    .then(function (response) {
                        var names = null;
                        if (angular.isDefined(response.data))
                            names = response.data.Names;
                        else
                            names = response.Names;
                        that.cache[local] = names;
                        defer.resolve(names);
                    }, function (response) {
                        defer.reject(response);
                    });
                return defer.promise;
            }
        }

        Region.prototype = {
            construct: Region,
            getCountryName: function (code, local) {
                code = angular.isString(code) ? code.toUpperCase() : code;
                local = angular.isString(local) ? local.toLowerCase() : 'fr';
                var defer = $q.defer();
                if (angular.isDefined(this.cache[local]))
                    defer.resolve(this.cache[local][code]);
                else
                    this.loadLocaleData(local)
                        .then(function (countries) {
                            defer.resolve(countries[code])
                        }, function (err) {
                            defer.reject(err);
                            throw new Error('Could load country with "' + code + '" code and "' + local + '" local')
                        });
                return defer.promise;
            },
            getCountryNames: function (local) {
                local = angular.isString(local) ? local.toLowerCase() : 'fr';
                var defer = $q.defer();
                if (angular.isDefined(this.cache[local]))
                    defer.resolve(this.cache[local]);
                else
                    this.loadLocaleData(local)
                        .then(function (countries) {
                            defer.resolve(countries)
                        }, function (err) {
                            defer.reject(err);
                            throw new Error('Could load countries with "' + local + '" local')
                        });
                return defer.promise;
            }
        };
        return new Region('http://localhost:3000/api/regions');
    }

})();