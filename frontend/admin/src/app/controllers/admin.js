(function () {

    angular
        .module('AbouEventAdmin')
        .controller('AdminCtrl', ['$scope', 'SideNavItems', '$mdSidenav', '$mdBottomSheet', '$q', '$state', '$mdToast',
            'AppName',
            '$mdMedia',
            AdminCtrl
        ]);

    function AdminCtrl($scope, SideNavItems, $mdSidenav, $mdBottomSheet, $q, $state, $mdToast, AppName, $mdMedia) {
        var vm = this;
        vm.appName = AppName;
        vm.menuItems = SideNavItems;
        vm.selectItem = selectItem;
        vm.toggleItemsList = toggleItemsList;
        vm.title = $state.current.data.title;
        vm.showSimpleToast = showSimpleToast;
        vm.showMainToolbar = false;

        $scope.$watch(function () {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function (sm) {
            vm.showMainToolbar = sm;
        });


        function toggleItemsList() {
            var pending = $mdBottomSheet.hide() || $q.when(true);

            pending.then(function () {
                $mdSidenav('left').toggle();
            });
        }

        function selectItem(item) {
            vm.title = item.name;
            vm.toggleItemsList();
            vm.showSimpleToast(vm.title);
        }

        function showSimpleToast(title) {
           /* $mdToast.show(
                $mdToast.simple()
                    .content(title)
                    .hideDelay(500)
                    .position('bottom right')
            );*/
        }
    }

})();
