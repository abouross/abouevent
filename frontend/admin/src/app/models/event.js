/**
 * Created by abou on 16/05/17.
 */
(function () {
    'use strict';

    angular.module('AbouEventAdmin')
        .service('Event', [
            '$http', 'ApiBaseUrl', '$mdToast', '_', '$abresource',
            eventModel
        ]);

    function eventModel($http, ApiBaseUrl, $mdToast, _, $abresource) {

        return _.assign($abresource('event'), {

            parseFilter: function (query) {
                var params = {};
                if (!query)
                    return params;
                if (angular.isDefined(query.published))
                    params['filter[published]'] = query.published ? 1 : 0;
                if (angular.isDefined(query.public))
                    params['filter[public]'] = query.public ? 1 : 0;
                if (angular.isDefined(query.type))
                    params['filter[event_type_id]'] = query.type;
                if (angular.isDefined(query.status)) {
                    angular.forEach(query.status, function (data, field) {
                        if (!angular.isObject(data) || !field)
                            return;
                        if (data.op)
                            params['filter[' + field + '][op]'] = data.op;
                        if (data.value)
                            params['filter[' + field + '][value]'] = data.value == 'now' ? new Date().toISOString() : data.value;
                        if (data.type)
                            params['filter[' + field + '][type]'] = data.type;
                    });
                }

                return params;
            },
            publish: function (id) {
                return $http.get(ApiBaseUrl + 'events/publish/' + id)
                    .catch(function (err) {
                        $mdToast.show(
                            $mdToast.danger()
                                .content(err.statusText || 'Erreur de connexion avec le serveur!')
                                .hideDelay(2500)
                                .position('top right')
                        );
                    });
            },
            groups: function(query){
                return $http.get(ApiBaseUrl + 'events/groups', {'params': query})
                    .catch(function (err) {
                        $mdToast.show(
                            $mdToast.danger()
                                .content(err.statusText || 'Erreur de connexion avec le serveur!')
                                .hideDelay(2500)
                                .position('top right')
                        );
                    });
            }
        })
    }
})();
