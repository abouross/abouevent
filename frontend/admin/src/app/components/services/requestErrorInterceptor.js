/**
 * Created by abou on 18/05/17.
 */
/**
 * @ngdoc overview
 * @name auth.interceptor
 * @description
 * The `angularApp.auth.interceptor` module which provides:
 *
 * - {@link auth.interceptor.service:AuthInterceptor AuthInterceptor-service}
 */

/**
 * @ngdoc service
 * @name auth.interceptor.service:AuthInterceptor
 * @description
 * Interceptor for handling authentication
 */

(function () {
    'use strict';

    // register the AuthInterceptor on the application module
    angular
        .module('AbouEventAdmin')
        .factory('RequestError', RequestError);

    RequestError.$inject = ['$q'];

    function RequestError($q) {
        // public API
        return {
            responseError: responseError
        };

        // Intercept 401s and redirect you to login
        function responseError(response) {
            if (response.status == -1) {

            }
            return $q.reject(response);
        }

    }

})();
