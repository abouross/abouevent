(function () {

    function instanceOf(object, constructor) {
        if (!angular.isObject(object))
            return false;
        var construct = angular.isDefined(object.prototype) ? object.prototype.constructor : object.__proto__.constructor;
        return construct === constructor;
    }

    angular
        .module('AbouEventAdmin')
        .controller('EventsCtrl', ['$scope', '$cookieStore', 'Event', 'BaseUrl', 'AbImage', '_', '$mdToast',
            'Settings', '$mdBottomSheet', '$mdDialog',
            EventsCtrl
        ]);

    function EventsCtrl($scope, $cookieStore, Event, BaseUrl, AbImage, _, $mdToast, Settings,
                        $mdBottomSheet, $mdDialog) {
        this.baseUrl = BaseUrl;
        this.abImage = AbImage;
        this.toast = $mdToast;
        this.scope = $scope;
        this.mdDialog = $mdDialog;
        this._ = _;
        this.bottomSheet = $mdBottomSheet;
        this.settings = Settings;
        this.isList = true;
        this.model = Event;
        this.cookie = $cookieStore;
        this.viewMode = $cookieStore.get('view_mode') || 'grid';
        this.events = [];
        this.total = 0;
        this.selected = [];
        this.pagination = {
            perPage: $cookieStore.get('pagination.limit') || 10,
            page: 1
        };
        this.search = '';
        this.sort = '-created_at';
        this.lastQuery = null;
        this.searching = false;

        this.progress = null;
        this.actionOpen = false;

        // init controller
        this.init();
    }

    EventsCtrl.prototype.init = function () {
        var that = this;

        // Pagination handlers
        this.scope.onPaginate = function () {
            var params = that.getParams();
            var query = JSON.stringify(params);
            if (query == that.lastQuery) return;
            that.lastQuery = query;
            that.progress = that.model.loadByPagination(params)
                .then(function (response) {
                    response = response.data || response;
                    that.setUp(response);
                });
        };

        // Options load
        this.eventTypes = this.settings.option.getOptionsByName('event_type')
            .then(function (response) {
                that.eventTypes = response.data || response;
            });

        //Parent Vars
        this.scope.$parent.ctrl = this;

        // Load for first time
        this.progress = this.model.loadByPagination(this.getParams())
            .then(function (response) {
                response = response.data || response;
                that.setUp(response);
            });

        // Columns
        this.columns = this.getColumns();

        // watch limit change
        this.scope.$watch('ctrl.pagination.perPage', function (newValue, oldValue) {
            if (isNaN(newValue) || isNaN(oldValue) || newValue === oldValue) {
                return;
            }
            that.cookie.put('pagination.limit', newValue);
        });

        // selection
        this.scope.selectedAction = function () {
            return angular.isArray(that.selected) && that.selected.length > 0;
        };

        this.scope.allSelected = function () {
            if (!angular.isArray(that.events))
                return false;
            return angular.isArray(that.selected) && that.selected.length == that.events.length;
        };
        this.scope.toggleAllSelect = function (e) {
            if (e && e.stopPropagation) {
                e.stopPropagation();
            }

            if (that.scope.allSelected())
                angular.forEach(that.events, function (item) {
                    if (that.scope.isSelected(item))
                        that.scope.deselect(item);
                });
            else
                angular.forEach(that.events, function (item) {
                    if (!that.scope.isSelected(item))
                        that.scope.select(item);
                });
        };

        this.scope.isSelected = function (item) {
            if (!angular.isArray(that.selected) || that.selected.length <= 0)
                return false;
            //return that.selected.indexOf(item) !== -1;
            return that._.findIndex(that.selected, function (s) {
                    return s.id == item.id;
                }) !== -1;
        };

        this.scope.select = function (item) {
            that.selected.push(item);
        };
        this.scope.deselect = function (item) {
            var pos = that._.findIndex(that.selected, function (s) {
                return s.id == item.id;
            });
            if (pos != -1)
                that.selected.splice(pos, 1);
        };
        this.scope.toggleSelect = function (item, event) {
            if (event && event.stopPropagation) {
                event.stopPropagation();
            }

            return that.scope.isSelected(item) ? that.scope.deselect(item) : that.scope.select(item);
        };

    };
    EventsCtrl.prototype.getColumns = function () {
        var columns = this.cookie.get('event_columns') || [],
            persist = columns.length <= 0,
            dcolomns = [
                {
                    key: 'id',
                    label: 'ID',
                    show: false,
                    orderBy: 'id'
                },
                {
                    key: 'short_name',
                    label: 'Nom',
                    show: true,
                    orderBy: 'short_name'
                },
                {
                    key: 'start_date',
                    label: 'Date du début',
                    show: true
                },
                {
                    key: 'end_date',
                    label: 'Date de la fin',
                    show: true
                },
                {
                    key: 'status',
                    label: 'Status',
                    show: true
                }, {
                    key: 'event_type',
                    label: 'Type',
                    show: true
                },
                {
                    key: 'created_at',
                    label: 'Crée le',
                    show: false
                },
                {
                    key: 'updated_at',
                    label: 'Mis à jour le',
                    show: false
                }
            ];

        if (persist) {
            this.cookie.put('event_columns', this._.merge(columns, dcolomns))
        }
        columns = this._.merge(columns, dcolomns);
        return columns;
    };
    EventsCtrl.prototype.updateColumns = function (columns) {
        this.cookie.put('event_columns', columns)
    };
    EventsCtrl.prototype.switchViewMode = function (toMode) {
        this.viewMode = toMode = toMode || this.viewMode == 'list' ? 'grid' : 'list';
        this.cookie.put('view_mode', toMode);
        this.init();
    };
    EventsCtrl.prototype.getParams = function () {
        var params = {
            "pagination[perPage]": this.pagination.perPage,
            "pagination[page]": this.pagination.page
        };
        if (this.search != '') {
            params['search'] = this.search;
        }

        var sort = this.sort || 'created_at',
            sortDir = 'desc';
        if (sort.indexOf('-') > -1) {
            sort = sort.replace(/^-/, '');
            sortDir = 'desc';
        }
        params['sort[' + sort + ']'] = sortDir;

        if (angular.isDefined(this.filter)) {
            params = this._.assign(params, this.model.parseFilter(this.filter))
        }
        return params;
    };
    EventsCtrl.prototype.setUp = function (response) {
        this.events = [];
        var that = this,
            width = 400, height = 400;
        angular.forEach(response.data, function (item) {
            if (item.image) {
                item.image.thumbUrl = that.baseUrl + '/file/thumb/' + item.image.id + '/' + width + '/' + height;
            }
            else
                item.image = {
                    thumbUrl: that.baseUrl + '/file/broken'
                };
            //item.image.downloadUrl = that.baseUrl + '/file/download/' + item.image.id;
            item.image.imgProgress = that.abImage.load(item.image.thumbUrl);
            item.start_date = new Date(item.start_date);
            item.end_date = new Date(item.end_date);
            item.created_at = new Date(item.created_at);
            item.updated_at = new Date(item.updated_at);
            this.push(item);
        }, this.events);
        this.total = response.total;
        this.pagination.perPage = response.per_page;
        this.pagination.page = response.current_page;
        this.searching = false;
    };
    EventsCtrl.prototype.refreshItems = function () {
        var params = this.getParams(), that = this;

        this.lastQuery = JSON.stringify(params);
        this.progress = this.model.loadByPagination(params)
            .then(function (response) {
                response = response.data || response;
                that.setUp(response);
            });
    };
    EventsCtrl.prototype.filtrer = function (query) {
        if (!query)
            return;

        var params = this.getParams();
        query = JSON.stringify(params);
        if (query == this.lastQuery) return;
        this.lastQuery = query;
        var that = this;
        this.progress = this.model.loadByPagination(params)
            .then(function (response) {
                response = response.data || response;
                that.setUp(response);
            });

    };
    EventsCtrl.prototype.deleteBatch = function () {
        if (this.selected.length <= 0)
            return null;
        var ids = [], self = this;
        this.selected.forEach(function (item) {
            this.push(item.id)
        }, ids);

        var confirm = this.mdDialog.confirm({
            textContent: 'Confirmer la suppression de ' + ids.length + ' éléments',
            ok: 'Supprimer',
            cancel: 'Annuler'
        });

        this.mdDialog
            .show(confirm)
            .then(function (confirm) {
                if (confirm && ids.length > 0) {
                    self.progress = self.model
                        .batchDelete(ids)
                        .then(function (response) {
                            self.handleMessage(response.deleted_count + ' lieux ont été supprimés avec succés!', 'success');
                            window.location.reload();
                        }, function (rejection) {
                            if (rejection.deleted_count > 0)
                                self.handleMessage(rejection.deleted_count + ' lieux ont été supprimés avec succés!', 'warning');
                        });
                }
            }, function (reject) {
            })
            .finally(function () {
                confirm = undefined;
            });
    };
    EventsCtrl.prototype.actionSheet = function (item) {
        var self = this;
        this.bottomSheet.show({
                template: '<md-bottom-sheet>' +
                '<md-button ng-if="ctrl.media(\'gt-xs\')" md-auto-focus="true" class="md-icon-button" style="float: right" ng-click="ctrl.mdBottomSheet.hide()">' +
                '<md-icon>close</md-icon>' +
                '</md-button>' +
                '<div layout="column"><md-progress-linear ng-if="ctrl.progress"></md-progress-linear>' +
                '<div layout="row" layout-xs="column" layout-align-gt-xs="center center">' +
                '<md-button ng-disabled="ctrl.progress" class="md-raised" ui-sref="admin.events.event({id:event.id,action:\'edit\'})" ng-click="ctrl.mdBottomSheet.hide()"' +
                '>' +
                '<md-icon>edit</md-icon> Modifier' +
                '</md-button>' +
                '<md-button ng-disabled="ctrl.progress" ng-click="ctrl.delete()" class="md-raised md-warn">' +
                '<md-icon>delete</md-icon> Supprimer' +
                '</md-button>' +
                '<md-button ng-disabled="ctrl.progress" class="md-accent md-raised" ng-if="!event.published" aria-label="publish" ng-click="ctrl.publish()">' +
                '<md-icon>publish</md-icon> Publier' +
                '</md-button>' +
                '<md-button ng-disabled="ctrl.progress" class="md-raised" ui-sref="admin.events.event({id:event.id,action:\'preview\'})" ng-click="ctrl.mdBottomSheet.hide()">' +
                '<md-icon>zoom_in</md-icon> Aperçu' +
                '</md-button>' +
                '</div></div>' +
                '</md-bottom-sheet>',
                controller: ActionSheetCtrl,
                controllerAs: 'ctrl',
                locals: {event: item, events: this.events}
            })
            .then(function (refresh) {
                if (refresh)
                    self.refreshItems();
            });
    };
    EventsCtrl.prototype.handleSearch = function (query) {
        if (this.searching == true)
            return;
        this.searching = true;
        query = query || this.search;
        this.pagination.page = 1;
        if (query == null || query == '')
            return;
        this.refreshItems();
    };
    EventsCtrl.prototype.handleMessage = function (message, type) {
        var toast = null;
        switch (type) {
            case 'success':
                toast = this.toast.success();
                break;
            case 'warning':
                toast = this.toast.warning();
                break;
            case 'danger':
                toast = this.toast.danger();
                break;
            default:
                toast = this.toast.simple();
        }
        if (toast)
            this.toast.show(
                toast
                    .content(message)
                    .hideDelay(2500)
                    .position('top right')
            );
    };


    //**** Actions sheet handler ****//
    function ActionSheetCtrl($scope, $mdBottomSheet, event, events, Event, $mdDialog, $mdMedia, $mdToast) {
        $scope.event = event;
        this.event = event;
        this.events = events;
        this.mdBottomSheet = $mdBottomSheet;
        this.mdDialog = $mdDialog;
        this.model = Event;
        this.media = $mdMedia;
        this.toast = $mdToast;
    }

    ActionSheetCtrl.prototype.close = function (refresh) {
        this.mdBottomSheet.hide(refresh);
    };
    ActionSheetCtrl.prototype.publish = function () {
        var self = this;
        if (this.event.published) {
            this.handleMessage('"' + this.event.short_name + '" a déjâ publié', 'warning');
            return;
        }
        this.progress = this.model
            .publish(this.event.id)
            .then(function (response) {
                if (!response) {
                    self.progress = false;
                    self.handleMessage('Impossible de supprimer "' + self.event.short_name + '"', 'danger');
                    return;
                }

                self.handleMessage('"' + self.event.short_name + '" publié avec succés !', 'success');
                self.event.published = true;
                self.close(true);
            }, function (response) {
                self.handleMessage('Impossible de supprimer "' + self.event.short_name + '"', 'danger');
            });
    };
    ActionSheetCtrl.prototype.delete = function () {
        var self = this;
        var confirm = this.mdDialog.confirm({
            textContent: 'Supprimer "' + this.event.short_name + '"?',
            ok: 'Supprimer',
            cancel: 'Annuler'
        });

        this.mdDialog
            .show(confirm)
            .then(function (confirm) {
                if (confirm) {
                    self.progress = self.model
                        .delete(self.event.id)
                        .then(function (response) {
                            self.events.splice(self.events.indexOf(self.event), 1);
                            self.handleMessage('"' + self.event.short_name + '" supprimé avec succés !', 'success');
                        }, function (rejection) {
                            defer.reject(rejection);
                            self.handleMessage('Impossible de supprimer"' + self.event.short_name + '"', 'danger');
                        }).finally(function () {
                            self.close();
                        })
                }
            }, function (reject) {
            })
            .finally(function () {
                confirm = undefined;
            });
    };
    ActionSheetCtrl.prototype.handleMessage = function (message, type) {
        var toast = null;
        switch (type) {
            case 'success':
                toast = this.toast.success();
                break;
            case 'warning':
                toast = this.toast.warning();
                break;
            case 'danger':
                toast = this.toast.danger();
                break;
            default:
                toast = this.toast.simple();
        }
        if (toast)
            this.toast.show(
                toast
                    .content(message)
                    .hideDelay(2500)
                    .position('top right')
            );
    };

    ActionSheetCtrl.$inject = ['$scope', '$mdBottomSheet', 'event', 'events', 'Event', '$mdDialog', '$mdMedia', '$mdToast'];

})();
