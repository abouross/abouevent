/**
 * Created by abou on 11/05/17.
 */

(function () {

    angular
        .module('AbouEventAdmin')
        .controller('SettingsCtrl', ['$scope', 'SettingsMenuItems', '$mdMedia', '$state',
            SettingsCtrl
        ]);

    function SettingsCtrl($scope, SettingsMenuItems, $mdMedia, $state) {
        $scope.settingsMenuItems = SettingsMenuItems;
        $scope.currentItemContext = SettingsMenuItems.length > 0 ? SettingsMenuItems[0].context : null;
        $scope.showInnerNav = $mdMedia('gt-sm');
        $scope.$watch(function () {
            return $mdMedia('gt-sm');
        }, function (isShow) {
            $scope.showInnerNav = isShow;
        });

    }

})();
