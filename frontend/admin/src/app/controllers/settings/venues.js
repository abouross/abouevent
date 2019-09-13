/**
 * Created by abou on 11/05/17.
 */
(function () {

    angular
        .module('AbouEventAdmin')
        .controller('VenuesCtrl', ['$scope', '$state', '$rootScope',
            VenuesCtrl
        ])
        .controller('VenuesListCtrl', ['$scope', 'Venue', '$mdDialog', '$mdToast', '$q',
            VenuesListCtrl])
        .controller('VenuesFormCtrl', ['$scope', '$stateParams', 'Venue', 'AbRegion', '$mdToast', '$state', VenuesFormCtrl]);

    function VenuesCtrl($scope, $state, $rootScope) {
        $scope.isList = $state.current.data.action == 'list' ? true : false;
        $scope.isForm = !$scope.isList;
        $scope.$watch(function () {
            return $state.current;
        }, function (cs) {
            $scope.isList = cs.data.action == 'list' ? true : false;
            $scope.isForm = !$scope.isList;
        });
    }

    function VenuesListCtrl($scope, Venue, $mdDialog, $mdToast, $q) {
        $scope.progress = null;
        $scope.venues = [];
        $scope.total = 0;
        $scope.selected = [];
        $scope.selectAction = false;
        $scope.errorAction = false;
        $scope.pagination = {
            perPage: 10,
            page: 1
        };
        $scope.search = '';
        $scope.sort = '-id';
        var lastQuery = null;
        $scope.searching = false;

        $scope.getVenues = function () {
            var params = getParams();
            var query = JSON.stringify(params);
            if (query == lastQuery) return;
            lastQuery = query;
            loadVenues(params);
        };
        $scope.refreshList = function () {
            var params = getParams();
            lastQuery = JSON.stringify(params);
            loadVenues(params);
        };
        $scope.deleteBatch = function () {
            if ($scope.selected.length <= 0)
                return null;
            var ids = [];
            $scope.selected.forEach(function (item) {
                this.push(item.id)
            }, ids);
            var confirm = $mdDialog.confirm({
                textContent: 'Supprimer les enregistrements selectionnés?',
                ok: 'Supprimer',
                cancel: 'Annuler'
            });

            $mdDialog
                .show(confirm)
                .then(function (confirm) {
                    if (confirm && ids.length > 0) {
                        $scope.progress = Venue
                            .batchDelete(ids)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.success()
                                        .content(response.deleted_count + ' lieux ont été supprimés avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                loadVenues(getParams());
                            }, function (rejection) {
                                if (rejection.deleted_count > 0)
                                    $mdToast.show(
                                        $mdToast.danger()
                                            .content(rejection.deleted_count + ' lieux ont été supprimés avec succés!')
                                            .hideDelay(2500)
                                            .position('top right')
                                    );
                            });
                    }
                }, function (reject) {
                })
                .finally(function () {
                    confirm = undefined;
                });
        };
        $scope.deleteItem = function (id) {
            var confirm = $mdDialog.confirm({
                textContent: 'Supprimer cet enregistrement?',
                ok: 'Supprimer',
                cancel: 'Annuler'
            });

            $mdDialog
                .show(confirm)
                .then(function (confirm) {
                    if (confirm && id) {
                        $scope.progress = Venue
                            .delete(id)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.success()
                                        .content('"' + response.data.name + '" a été supprimer avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                loadVenues(getParams());
                            }, function (rejection) {
                                defer.reject(rejection);
                            });

                    }
                }, function (reject) {
                })
                .finally(function () {
                    confirm = undefined;
                });
        };
        $scope.onSelectChange = function (selected) {
            $scope.selectAction = angular.isArray($scope.selected) && $scope.selected.length > 0;
        };
        $scope.refreshSearch = refreshSearch;

        function loadVenues(query, progress) {
            progress = angular.isDefined(progress) ? progress : true;
            var promise = Venue
                .loadByPagination(query);
            if (progress) {
                $scope.progress = promise.then(function (response) {
                    response = response.data;
                    $scope.venues = response.data;
                    $scope.total = response.total;
                    setParams(response);
                });
                return null;
            }

            return promise;
        }


        function getParams() {
            var params = {
                "pagination[perPage]": $scope.pagination.perPage,
                "pagination[page]": $scope.pagination.page
            };
            if ($scope.search != '') {
                params['search'] = $scope.search;
            }

            var sort = $scope.sort || 'created_at',
                sortDir = 'asc';
            if (sort.indexOf('-') > -1) {
                sort = sort.replace(/^-/, '');
                sortDir = 'desc';
            }
            params['sort[' + sort + ']'] = sortDir;

            return params;
        }

        function setParams(data) {
            $scope.pagination.perPage = data.per_page;
            $scope.pagination.page = data.current_page;
            $scope.searching = false;
        }

        function refreshSearch(search) {
            if ($scope.searching)
                return;
            setTimeout(function () {
                $scope.searching = true;
                search = search || $scope.search;
                $scope.pagination.page = 1;
                if (search == null || search == '')
                    return;
                loadVenues(getParams());
            }, 500);
        }


        loadVenues($scope.query);
    }

    function VenuesFormCtrl($scope, $stateParams, Venue, AbRegion, $mdToast, $state) {
        var id = $stateParams.id, isNew;
        isNew = $scope.$parent.isNew = $scope.isNew = (angular.isDefined(id) && id != null) ? false : true;
        $scope.$parent.venue = $scope.venue = null;
        $scope.originalVenue = null;
        $scope.changed = false;
        $scope.countries = null;
        $scope.redirectToList = false;
        $scope.errors = null;
        function getCountries() {
            if ($scope.countries != null && anglar.isArray($scope.countries))
                return countries;
            return AbRegion.getCountryNames('fr')
                .then(function (countries) {
                    $scope.countries = [];
                    angular.forEach(countries, function (item, code) {
                        this.push({code: code, name: item});
                    }, $scope.countries);
                });
        }

        $scope.$watch('venue', function (newVenue, oldValue) {
            if (newVenue == null)
                return;
            $scope.$parent.venue = newVenue;
        });
        $scope.submitForm = function (form) {
            if (!isNew)
                Venue.update($scope.originalVenue.id, $scope.venue)
                    .then(handleSuccess, handleError);
            else {
                Venue.store($scope.venue)
                    .then(handleSuccess, handleError)
            }
        };
        $scope.redirect = function () {
            $scope.redirectToList = true;
        };
        if (!isNew) {
            $scope.progress = Venue.get(id)
                .then(function (response) {
                    if (angular.isDefined(response.data))
                        $scope.originalVenue = response.data;
                    else
                        $scope.originalVenue = response;
                    setVenue();
                })
        }
        function setVenue() {
            if ($scope.originalVenue == null)
                return;
            var venue = angular.copy($scope.originalVenue);
            delete venue.id;
            delete venue.created_at;
            delete venue.updated_at;
            delete venue.events_count;
            $scope.venue = venue;
        }

        function handleSuccess(response) {
            if (angular.isUndefined(response))
                return;
            if (angular.isDefined(response['data']))
                $scope.originalVenue = response.data;
            else
                $scope.originalVenue = response;

            if (isNew) {
                $mdToast.show(
                    $mdToast.success()
                        .content('"' + $scope.originalVenue.name + '" a été crée avec succés!')
                        .hideDelay(2500)
                        .position('top right')
                );
                return $state.go('admin.settings.venues.update', {id: $scope.originalVenue.id});
            }
            $mdToast.show(
                $mdToast.success()
                    .content('"' + $scope.originalVenue.name + '" a été modifier avec succés!')
                    .hideDelay(2500)
                    .position('top right')
            );
            if ($scope.redirectToList)
                return $state.go('admin.settings.venues.list');
            setVenue();
        }

        function handleError(response) {
            if (angular.isUndefined(response))
                return;
            if (response.status == 422) {
                $scope.errors = response.data;
            }
        }

        getCountries();
    }

})();
