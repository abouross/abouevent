/**
 * Created by abou on 16/05/17.
 */
(function () {
    'use strict';

    angular.module('AbouEventAdmin')
        .service('Venue', [
            '$http', 'ApiBaseUrl', '$mdToast', '$q',
            venueModel
        ]);

    function venueModel($http, ApiBaseUrl, $mdToast, $q) {
        var url = ApiBaseUrl + 'venues';

        function BatchDeleter(ids) {
            this.ids = ids;
            this.count = ids.length;
            this.deleteCount = 0;
            this.errorCount = 0;
            // I am the possible states that the preloader can be in.
            this.states = {
                PENDING: 1,
                LOADING: 2,
                RESOLVED: 3,
                REJECTED: 4
            };
            // I keep track of the current state of the preloader.
            this.state = this.states.PENDING;
            // When loading the images, a promise will be returned to indicate
            // when the loading has completed (and / or progressed).
            this.deferred = $q.defer();
            this.promise = this.deferred.promise;
        }

        // ---
        // INSTANCE METHODS.
        // ---
        BatchDeleter.prototype = {
            // Best practice for "instnceof" operator.
            constructor: BatchDeleter,
            // ---
            // PUBLIC METHODS.
            // ---
            // I determine if the preloader has started loading images yet.
            isInitiated: function isInitiated() {
                return ( this.state !== this.states.PENDING );
            },
            // I determine if the preloader has failed to load all of the images.
            isRejected: function isRejected() {
                return ( this.state === this.states.REJECTED );
            },
            // I determine if the preloader has successfully loaded all of the images.
            isResolved: function isResolved() {
                return ( this.state === this.states.RESOLVED );
            },
            delete: function load() {
                // If already loading, return the existing promise.
                if (this.isInitiated()) {
                    return this.promise;
                }
                this.state = this.states.LOADING;
                for (var i = 0; i < this.count; i++) {
                    this.deleteItem(this.ids[i]);
                }
                // Return the deferred promise for the load event.
                return this.promise;
            },
            handleError: function handleImageError(id) {
                this.errorCount++;
                // If the preload action has already failed, ignore further action.
                if (this.isRejected()) {
                    return;
                }
                this.state = this.states.REJECTED;
                this.deferred.reject({'deleted_count': this.deleteCount, 'error_count': this.errorCount});
            },
            handleDelete: function handleImageLoad(id) {
                this.deleteCount++;
                if (this.isRejected()) {
                    return;
                }
                this.deferred.notify({
                    percent: Math.ceil(this.deleteCount / this.count * 100),
                    id: id
                });
                if (this.deleteCount === this.count) {
                    this.state = this.states.RESOLVED;
                    this.deferred.resolve({'deleted_count': this.deleteCount, 'error_count': this.errorCount});
                }
            },
            deleteItem: function deleteItem(id) {
                var deleter = this;
                var venue = $http.delete(url + '/' + id)
                    .then(function (response) {
                        deleter.handleDelete(id);
                        deleter = venue = response = null;
                    }, function (response) {
                        deleter.handleError(id);
                        deleter = venue = response = null;
                    });
            }
        };

        return {
            loadByPagination: function (query) {
                return $http.get(url, {'params': query})
                    .catch(function (err) {
                        $mdToast.show(
                            $mdToast.danger()
                                .content(err.statusText || 'Erreur de connexion avec le serveur!')
                                .hideDelay(2500)
                                .position('top right')
                        );
                    });
            },
            all: function () {
                return $http.get(url, {'params': {'all': true}})
                    .catch(function (err) {
                        $mdToast.show(
                            $mdToast.danger()
                                .content(err.statusText || 'Erreur de connexion avec le serveur!')
                                .hideDelay(2500)
                                .position('top right')
                        );
                    });
            },
            get: function (id) {
                return $http.get(url + '/' + id)
                    .catch(function (err) {
                        $mdToast.show(
                            $mdToast.danger()
                                .content(err.statusText || 'Erreur de connexion avec le serveur!')
                                .hideDelay(2500)
                                .position('top right')
                        );
                    });
            },
            store: function (data) {
                if (angular.isObject(data.image))
                    data.image = data.image.id;
                return $http.post(url, data);
            },
            update: function (id, data) {
                if (angular.isObject(data.image))
                    data.image = data.image.id;
                return $http.put(url + '/' + id, data);
            },
            delete: function (id) {
                return $http.delete(url + '/' + id)
                    .catch(function (err) {
                        $mdToast.show(
                            $mdToast.danger()
                                .content(err.statusText || 'Erreur de connexion avec le serveur!')
                                .hideDelay(2500)
                                .position('top right')
                        );
                    });
            },
            batchDelete: function (ids) {
                var deleter = new BatchDeleter(ids);
                return deleter.delete();
            }
        }
    }
})();