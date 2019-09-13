'use strict';

angular.module('AbouEventAdmin')
    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('admin', {
                url: '',
                templateUrl: 'app/views/admin.html',
                controller: 'AdminCtrl',
                controllerAs: 'vm',
                abstract: true
            })

            /***** dashboard *****/
            .state('admin.dashboard', {
                url: '/dashboard',
                templateUrl: 'app/views/dashboard.html',
                controller: 'DashboardCtrl',
                controllerAs: 'ctrl',
                data: {
                    title: 'Tableau de bord'
                }
            })

            /*** events *****/
            .state('admin.events', {
                url: '/events',
                templateUrl: 'app/views/events/events.html',
                abstract: true
            })
            .state('admin.events.create', {
                url: '/create',
                templateUrl: 'app/views/events/new.html',
                controller: 'EventCreateCtrl',
                controllerAs: 'ctrl',
                data: {
                    title: 'Nouvel événement'
                }
            })
            .state('admin.events.list', {
                url: '/list',
                templateUrl: 'app/views/events/list.html',
                controller: 'EventsCtrl',
                controllerAs: 'ctrl',
                data: {
                    title: 'Evénements'
                }
            })
            .state('admin.events.event', {
                url: '/event/{id}/{action}',
                templateUrl: 'app/views/events/event.html',
                controller: 'EventCtrl',
                controllerAs: 'ctrl',
                data: {
                    title: 'Evénement'
                }
            })

            /**** settings *****/
            .state('admin.settings', {
                url: '/settings',
                templateUrl: 'app/views/settings/layout.html',
                controller: 'SettingsCtrl',
                abstract: true
            })
            //// Venue ///////
            .state('admin.settings.venues', {
                url: '/venues',
                templateUrl: 'app/views/settings/venues/default.html',
                controller: 'VenuesCtrl',
                abstract: true,
                data: {
                    title: 'Lieu de rencontre'
                }
            }).state('admin.settings.venues.list', {
                url: '/venues/list',
                templateUrl: 'app/views/settings/venues/list.html',
                controller: 'VenuesListCtrl',
                data: {
                    title: 'Liste des lieux de rencontre',
                    action: 'list'
                }
            })
            .state('admin.settings.venues.create', {
                url: '/venues/create',
                templateUrl: 'app/views/settings/venues/form.html',
                controller: 'VenuesFormCtrl',
                data: {
                    title: 'Nouvel lieu de rencontre',
                    action: 'create'
                }
            })
            .state('admin.settings.venues.update', {
                url: '/venues/update/:id',
                templateUrl: 'app/views/settings/venues/form.html',
                controller: 'VenuesFormCtrl',
                data: {
                    title: 'Mise à jour d\'un lieu de rencontre',
                    action: 'update'
                }
            })
            ////// Lodgings ////////
            .state('admin.settings.lodgings', {
                url: '/lodgings',
                templateUrl: 'app/views/settings/lodgings/default.html',
                controller: 'LodgingsCtrl',
                abstract: true,
                data: {
                    title: 'Hebergements'
                }
            }).state('admin.settings.lodgings.list', {
                url: '/lodgings/list',
                templateUrl: 'app/views/settings/lodgings/list.html',
                controller: 'LodgingsListCtrl',
                data: {
                    title: 'Liste des Hebergements',
                    action: 'list'
                }
            })
            .state('admin.settings.lodgings.create', {
                url: '/lodgings/create',
                templateUrl: 'app/views/settings/lodgings/form.html',
                controller: 'LodgingsFormCtrl',
                data: {
                    title: 'Nouvel Hebergement',
                    action: 'create'
                }
            })
            .state('admin.settings.lodgings.update', {
                url: '/lodgings/update/:id',
                templateUrl: 'app/views/settings/lodgings/form.html',
                controller: 'LodgingsFormCtrl',
                data: {
                    title: 'Mise à jour d\'un lieu d\'Hebergement',
                    action: 'update'
                }
            })

            //// Option ///////
            .state('admin.settings.options', {
                url: '/options',
                templateUrl: 'app/views/settings/options/default.html',
                controller: 'OptionsCtrl',
                abstract: true,
                data: {
                    title: "Options"
                }
            }).state('admin.settings.options.list', {
                url: '/options/list',
                templateUrl: 'app/views/settings/options/list.html',
                controller: 'OptionsListCtrl',
                data: {
                    title: 'Liste des Options',
                    action: 'list'
                }
            })
            .state('admin.settings.options.create', {
                url: '/options/create',
                templateUrl: 'app/views/settings/options/form.html',
                controller: 'OptionsFormCtrl',
                data: {
                    title: 'Nouvel Option',
                    action: 'create'
                }
            })
            .state('admin.settings.options.update', {
                url: '/options/update/:id',
                templateUrl: 'app/views/settings/options/form.html',
                controller: 'OptionsFormCtrl',
                data: {
                    title: 'Mise à jour d\'une Options',
                    action: 'update'
                }
            })

            // Medias
            .state('admin.settings.medias', {
                url: '/medias',
                templateUrl: 'app/views/settings/medias/index.html',
                controller: 'MediasCtrl',
                data: {
                    title: 'Media Manager'
                }
            });


        $urlRouterProvider.otherwise('/dashboard');
    });