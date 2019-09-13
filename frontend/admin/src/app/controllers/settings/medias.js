/**
 * Created by abou on 11/05/17.
 */
(function () {

    angular
        .module('AbouEventAdmin')
        .controller('MediasCtrl', ['$scope', 'Media', 'BaseUrl', '$mdDialog', 'AbImage', '$mdToast', MediasCtrl]);

    function MediasCtrl($scope, Media, BaseUrl, $mdDialog, AbImage, $mdToast) {
        $scope.$parent.currentItemContext = 'medias';
        $scope.files = [];
        $scope.enableSelect = false;
        $scope.selected = [];
        $scope.selectAll = false;
        $scope.progress = Media.all()
            .then(setUp);

        $scope.selectItem = function (item) {
            if ($scope.selectAll) {
                $scope.selectAll = false;
                unselectAll();
                item.selected = true
            }
            if (!angular.isArray($scope.selected))
                $scope.selected = [];
            if (item.selected)
                $scope.selected.push(item);
            else {
                $scope.selected.shift(item);
            }
        };

        $scope.toggleAllSelect = function () {
            if ($scope.selectAll)
                selectAll();
            else
                unselectAll();
        };

        $scope.toggleSelect = function () {
            $scope.enableSelect = !$scope.enableSelect;
        };

        $scope.refreshMedias = function () {
            $scope.files = [];
            $scope.progress = Media.all()
                .then(setUp);
        };
        $scope.show = function (item, event) {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                targetEvent: event,
                templateUrl: 'app/views/settings/medias/dialog.html',
                locals: {
                    item: item,
                    parentScope: $scope
                },
                controller: DialogController
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
                        $scope.progress = Media
                            .delete(id)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content('Média supprimé avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                $scope.refreshMedias();
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
                        $scope.progress = Media
                            .batchDelete(ids)
                            .then(function (response) {
                                $mdToast.show(
                                    $mdToast.simple()
                                        .content(response.deleted_count + ' médias ont été supprimés avec succés!')
                                        .hideDelay(2500)
                                        .position('top right')
                                );
                                $scope.refreshMedias();
                            }, function (rejection) {
                                if (rejection.deleted_count > 0)
                                    $mdToast.show(
                                        $mdToast.simple()
                                            .content(rejection.deleted_count + ' Médias ont été supprimés avec succés!')
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

        $scope.uploadMedia = function () {
            var parentEl = angular.element(document.body);
            $mdDialog.show({
                parent: parentEl,
                templateUrl: 'app/views/settings/medias/form.html',
                locals: {
                    parentScope: $scope
                },
                controller: UploadController
            });
        };

        function setUp(response) {
            $scope.enableSelect = false;
            $scope.selected = [];
            $scope.selectAll = false;

            if (angular.isDefined(response.data))
                response = response.data;
            $scope.files = [];
            var width = 400, height = 400;
            response.forEach(function (item) {
                item.url = BaseUrl + '' + item.path;
                item.thumbUrl = BaseUrl + '/file/thumb/' + item.id + '/' + width + '/' + height;
                item.downloadUrl = BaseUrl + '/file/download/' + item.id;
                item.imgProgress = AbImage.load(item.thumbUrl);
                this.push(item);
            }, $scope.files);
        }

        function selectAll() {
            $scope.selected = [];
            $scope.files.forEach(function (item, pos) {
                item.selected = true;
                this.push(item);
            }, $scope.selected);
        }

        function unselectAll() {
            $scope.files.forEach(function (item, pos) {
                item.selected = false;
                this.shift(item);
            }, $scope.selected);
        }
    }

    function DialogController($scope, $mdDialog, item, Media, parentScope, AbImage) {
        $scope.imgProgress = AbImage.load(item.url);
        $scope.item = angular.copy(item);
        $scope.inchanged = true;
        $scope.closeDialog = function () {
            $mdDialog.hide();
        };

        $scope.onChange = function () {
            if ($scope.item.name != item.name || $scope.item.description != item.description)
                $scope.inchanged = false;
            else
                $scope.inchanged = true;
        };

        $scope.saveInfo = function () {
            var info = {
                title: $scope.item.title,
                description: $scope.item.description
            };
            if ((info.title == null || info.title == '') && (info.description == null || info.description == ''))
                return;
            $scope.progress = Media.update($scope.item.id, info)
                .then(function (response) {
                    if (angular.isDefined(response.data))
                        response = response.data;
                    $scope.item = response;
                    item = response;
                    $scope.inchanged = true;
                    parentScope.refreshMedias();
                }, function (response) {
                    if (angular.isDefined(response.data))
                        response = response.data;
                })
        }
    }

    function UploadController($scope, $mdDialog, parentScope, ApiBaseUrl) {
        $scope.uploadUrl = ApiBaseUrl + 'medias';
        $scope.closeDialog = function () {
            $mdDialog.hide();
        };
        $scope.uploadComplete = function (content) {
            parentScope.refreshMedias();
            $mdDialog.hide();
        };
        $scope.onError = function (error) {
            console.log(error);
            $scope.error = true;
        }
    }

})();
