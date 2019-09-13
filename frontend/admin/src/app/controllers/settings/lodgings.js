/**
 * Created by abou on 11/05/17.
 */
(function () {
    angular
        .module('AbouEventAdmin')
        .controller('LodgingsCtrl', ['$scope', '$state', '$rootScope',
            LodgingsCtrl
        ])
        .controller('LodgingsListCtrl', ['$scope', 'Lodging', '$mdDialog', '$mdToast', '$q',
            LodgingsListCtrl])
        .controller('LodgingsFormCtrl', ['$scope', '$stateParams', 'Lodging', 'AbRegion', '$mdToast', '$state', LodgingsFormCtrl]);

    function LodgingsCtrl($scope, $state, $rootScope) {
        $scope.$parent.currentItemContext = 'lodgings';
        $scope.isList = $state.current.data.action == 'list' ? true : false;
        $scope.isForm = !$scope.isList;
        $scope.$watch(function () {
            return $state.current;
        }, function (cs) {
            $scope.isList = cs.data.action == 'list' ? true : false;
            $scope.isForm = !$scope.isList;
        });
    }

    function LodgingsListCtrl($scope, Lodging, $mdDialog, $mdToast, $q) {
        $scope.progress = null;
        $scope.lodgings = [];
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

        $scope.getLodgings = function () {
            var params = getParams();
            var query = JSON.stringify(params);
            if (query == lastQuery) return;
            lastQuery = query;
            loadLodgings(params);
        };
        $scope.refreshList = function () {
            var params = getParams();
            lastQuery = JSON.stringify(params);
            loadLodgings(params);
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
                        $scope.progress = Lodging
                            .batchDelete(ids)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content(response.deleted_count + ' lieux ont été supprimés avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                loadLodgings(getParams());
                            }, function (rejection) {
                                if (rejection.deleted_count > 0)
                                    $mdToast.show(
                                        $mdToast.simple()
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
                        $scope.progress = Lodging
                            .delete(id)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('"' + response.data.name + '" a été supprimer avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                loadLodgings(getParams());
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

        function loadLodgings(query, progress) {
            progress = angular.isDefined(progress) ? progress : true;
            var promise = Lodging
                .loadByPagination(query);
            if (progress) {
                $scope.progress = promise.then(function (response) {
                    response = response.data;
                    $scope.lodgings = response.data;
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
                loadLodgings(getParams());
            }, 500);
        }


        loadLodgings($scope.query);
    }

    function LodgingsFormCtrl($scope, $stateParams, Lodging, AbRegion, $mdToast, $state) {
        var id = $stateParams.id, isNew;
        isNew = $scope.$parent.isNew = $scope.isNew = (angular.isDefined(id) && id != null) ? false : true;
        $scope.$parent.lodging = $scope.lodging = null;
        $scope.originalLodging = null;
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

        $scope.$watch('lodging', function (newLodging, oldValue) {
            if (newLodging == null)
                return;
            $scope.$parent.lodging = newLodging;
        });
        $scope.submitForm = function (form) {
            if (!isNew)
                Lodging.update($scope.originalLodging.id, $scope.lodging)
                    .then(handleSuccess, handleError);
            else
                Lodging.store($scope.lodging)
                    .then(handleSuccess, handleError)
        };
        $scope.redirect = function () {
            $scope.redirectToList = true;
        };
        if (!isNew) {
            $scope.progress = Lodging.get(id)
                .then(function (response) {
                    if (angular.isDefined(response.data))
                        $scope.originalLodging = response.data;
                    else
                        $scope.originalLodging = response;
                    setLodging();
                })
        }
        function setLodging() {
            if ($scope.originalLodging == null)
                return;
            var lodging = angular.copy($scope.originalLodging);
            delete lodging.id;
            delete lodging.created_at;
            delete lodging.updated_at;
            delete lodging.events_count;
            $scope.lodging = lodging;
        }

        function handleSuccess(response) {
            if (angular.isUndefined(response))
                return;
            if (angular.isDefined(response['data']))
                $scope.originalLodging = response.data;
            else
                $scope.originalLodging = response;

            if (isNew) {
                $mdToast.show(
                    $mdToast.success()
                        .content('"' + $scope.originalLodging.name + '" a été crée avec succés!')
                        .hideDelay(2500)
                        .position('top right')
                );
                return $state.go('admin.settings.lodgings.update', {id: $scope.originalLodging.id});
            }
            $mdToast.show(
                $mdToast.success()
                    .content('"' + $scope.originalLodging.name + '" a été modifier avec succés!')
                    .hideDelay(2500)
                    .position('top right')
            );
            if ($scope.redirectToList)
                return $state.go('admin.settings.lodgings.list');
            setLodging();
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
