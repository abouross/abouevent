'use strict';

angular.module('AbouEventAdmin')
    .constant('SideNavItems', [
        {
            name: 'Tableau de bord',
            icon: 'dashboard',
            activeState: 'admin.dashboard',
            sref: '.dashboard'
        },
        {
            name: 'Evenements',
            icon: 'event',
            activeState: 'admin.events',
            sref: '.events.list'
        },
        {
            name: 'Configuration',
            icon: 'settings',
            activeState: 'admin.settings',
            sref: '.settings.venues.list'
        }
    ])
    .constant('SettingsMenuItems', [
        {
            context: 'venues',
            name: 'Lieu de rencontre',
            icon: 'home',
            activeState: 'admin.settings.venues',
            sref: '.venues.list'
        },
        {
            context: 'lodgings',
            name: 'Logements',
            icon: 'hotel',
            activeState: 'admin.settings.lodgings',
            sref: '.lodgings.list'
        },
        {
            context: 'medias',
            name: 'Médias',
            icon: 'image',
            activeState: 'admin.settings.medias',
            sref: '.medias'
        },
        {
            context: 'options',
            name: 'Options',
            icon: 'view_list',
            activeState: 'admin.settings.options',
            sref: '.options.list'
        }
    ])
    .constant('DefaultModelAction', [
        {
            name: 'list',
            label: 'List',
            icon: 'list'
        }, {
            name: 'edit',
            label: 'Mise à jour',
            icon: 'edit'
        }, {
            name: 'create',
            label: 'Ajouter',
            icon: 'add'
        }
    ])
    .constant('AppName', 'AbouEvent')
    .constant('ApiBaseUrl', 'http://localhost:8000/api/')
    .constant('BaseUrl', 'http://localhost:8000')
    .config(function ($httpProvider) {
        $httpProvider.defaults.transformResponse.push(function (d) {

            if (angular.isObject(d) && angular.isString(d.start_date)) {
                //d.start_date = new Date(Date.parse(d.start_date));
                //d.start_date = Date.parse(d.start_date);
            }
            if (angular.isObject(d) && angular.isString(d.end_date)) {
                //d.end_date = new Date(Date.parse(d.end_date));
            }
            return d;
        })
    });

