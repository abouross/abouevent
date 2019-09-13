/**
 * Created by abou on 11/05/17.
 */
(function () {

    angular
        .module('AbouEventAdmin')
        .controller('OptionsCtrl', ['$scope', '$state', '$rootScope',
            OptionsCtrl
        ])
        .controller('OptionsListCtrl', ['$scope', 'Option', '$mdDialog', '$mdToast', '$q',
            OptionsListCtrl])
        .controller('OptionsFormCtrl', ['$scope', '$stateParams', 'Option', 'AbRegion', '$mdToast', '$state', OptionsFormCtrl]);

    function OptionsCtrl($scope, $state, $rootScope) {
        $scope.$parent.currentItemContext = 'options';
        $scope.isList = $state.current.data.action == 'list' ? true : false;
        $scope.isForm = !$scope.isList;
        $scope.$watch(function () {
            return $state.current;
        }, function (cs) {
            $scope.isList = cs.data.action == 'list' ? true : false;
            $scope.isForm = !$scope.isList;
        });
    }

    function OptionsListCtrl($scope, Option, $mdDialog, $mdToast, $q) {
        $scope.progress = null;
        $scope.options = [];
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
        $scope.filter = {};
        var lastQuery = null;
        $scope.searching = false;
        $scope.optionsTypes = Option.getOptionsTypes()
            .then(function (response) {
                if (angular.isDefined(response.data))
                    $scope.optionsTypes = response.data;
                else
                    $scope.optionsTypes = response;
            });

        $scope.getOptions = function () {
            var params = getParams();
            var query = JSON.stringify(params);
            if (query == lastQuery) return;
            lastQuery = query;
            loadOptions(params);
        };
        $scope.refreshList = function () {
            var params = getParams();
            lastQuery = JSON.stringify(params);
            loadOptions(params);
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
                        $scope.progress = Option
                            .batchDelete(ids)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content(response.deleted_count + ' options ont été supprimés avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                loadOptions(getParams());
                            }, function (rejection) {
                                if (rejection.deleted_count > 0)
                                    $mdToast.show(
                                        $mdToast.simple()
                                            .content(rejection.deleted_count + ' options ont été supprimés avec succés!')
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
                        $scope.progress = Option
                            .delete(id)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('"' + response.data.name + '" a été supprimer avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                loadOptions(getParams());
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
        $scope.refreshFilter = refreshFilter;

        function loadOptions(query, progress) {
            progress = angular.isDefined(progress) ? progress : true;
            var promise = Option
                .loadByPagination(query);
            if (progress) {
                $scope.progress = promise.then(function (response) {
                    response = response.data;
                    $scope.options = [];
                    response.data.forEach(function (item) {
                        item.real_name = $scope.optionsTypes[item.name] || $scope.name;
                        this.push(item);
                    }, $scope.options);
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

            if ($scope.filter.length > 0 ||
                (angular.isDefined($scope.filter.name) && $scope.filter.name != '' && $scope.filter.name != null)) {
                angular.forEach($scope.filter, function (item, key) {
                    console.log(item, key);
                    if (angular.isDefined(item) && item != '' && item != null) {
                        this['filter[' + key + ']'] = item;
                    }
                }, params);
            }

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
                loadOptions(getParams());
            }, 500);
        }

        function refreshFilter(key, value) {
            console.log(key, value);
            if (angular.isUndefined(key) || key == null || key == '')
                return;
            if (angular.isUndefined(value) || value == null || value == '')
                return;

            $scope.pagination.page = 1;
            if (value == 'none')
                delete $scope.filter[key];
            else
                $scope.filter[key] = value;
            loadOptions(getParams());
        }


        loadOptions($scope.query);
    }

    function OptionsFormCtrl($scope, $stateParams, Option, AbRegion, $mdToast, $state) {
        var id = $stateParams.id, isNew;
        isNew = $scope.$parent.isNew = $scope.isNew = (angular.isDefined(id) && id != null) ? false : true;
        $scope.$parent.option = $scope.option = null;
        $scope.originalOption = null;
        $scope.changed = false;
        $scope.countries = null;
        $scope.redirectToList = false;
        $scope.errors = null;
        $scope.optionsTypes = Option.getOptionsTypes()
            .then(function (response) {
                if (angular.isDefined(response.data))
                    $scope.optionsTypes = response.data;
                else
                    $scope.optionsTypes = response;
            });

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

        $scope.$watch('option', function (newOption, oldValue) {
            if (newOption == null)
                return;
            $scope.$parent.option = newOption;
        });
        $scope.submitForm = function (form) {
            if (!isNew)
                Option.update($scope.originalOption.id, $scope.option)
                    .then(handleSuccess, handleError);
            else {
                Option.store($scope.option)
                    .then(handleSuccess, handleError)
            }
        };
        $scope.redirect = function () {
            $scope.redirectToList = true;
        };
        if (!isNew) {
            $scope.progress = Option.get(id)
                .then(function (response) {
                    if (angular.isDefined(response.data))
                        $scope.originalOption = response.data;
                    else
                        $scope.originalOption = response;
                    setOption();
                })
        }
        function setOption() {
            if ($scope.originalOption == null)
                return;
            var option = angular.copy($scope.originalOption);
            delete option.id;
            delete option.created_at;
            delete option.updated_at;
            delete option.events_count;
            $scope.option = option;
        }

        function handleSuccess(response) {
            if (angular.isUndefined(response))
                return;
            if (angular.isDefined(response['data']))
                $scope.originalOption = response.data;
            else
                $scope.originalOption = response;

            if (isNew) {
                $mdToast.show(
                    $mdToast.simple()
                        .content('"' + $scope.originalOption.value + '" a été crée avec succés!')
                        .hideDelay(2500)
                        .position('top right')
                );
                return $state.go('admin.settings.options.update', {id: $scope.originalOption.id});
            }
            $mdToast.show(
                $mdToast.simple()
                    .content('"' + $scope.originalOption.name + '" a été modifier avec succés!')
                    .hideDelay(2500)
                    .position('top right')
            );
            if ($scope.redirectToList)
                return $state.go('admin.settings.options.list');
            setOption();
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

})
();
