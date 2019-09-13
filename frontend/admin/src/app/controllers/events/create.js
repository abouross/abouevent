/**
 * Created by abou on 30/05/17.
 */
(function () {
    'use strict';
    angular.module('AbouEventAdmin')
        .controller('EventCreateCtrl', EventCreateCtrl);
    function EventCreateCtrl($scope, $state, Event, $timeout, $mdMedia, $mdToast, Settings, _, $filter) {
        this.scope = $scope;
        this.state = $state;
        this.isCreate = true;
        this.preview = false;
        this.toast = $mdToast;
        this.model = Event;
        this.event = null;
        this.progress = null;
        this.timeout = $timeout;
        this.media = $mdMedia;
        this.settings = Settings;
        this._ = _;
        this.availableColors = {
            primary: ['#16a085', '#27ae60', '#2980b9', '#8e44ad', '#34495e', '#f39c12', '#d35400', '#c0392b', '#7f8c8d', '#4f5458'],
            secondary: ['#16a085', '#27ae60', '#3498db', '#9b59b6', '#34495e', '#f39c12', '#e67e22', '#e74c3c', '#708598', '#4f5458'],
            accent: ['#16a085', '#27ae60', '#3498db', '#9b59b6', '#34495e', '#f39c12', '#e67e22', '#e74c3c', '#708598', '#4f5458']
        };
        this.dateLocale = {
            formatDate: function defaultFormatDate(date, timezone) {
                if (!date) {
                    return '';
                }

                return $filter('date')(date, 'short', timezone);
            }
        };

        this.init();
    }

    EventCreateCtrl.prototype.init = function () {
        this.scope.$parent.ctrl = this;
        var that = this;

        this.event = {
            color: {
                primary: null,
                secondary: null,
                accent: null
            }
        };

        // Settings load

        this.venues = this.settings.venue.all().then(function (response) {
            that.venues = response.data || response;
        });
        this.lodgings = this.settings.lodging.all().then(function (response) {
            that.lodgings = response.data || response;
            that.flodgings = that.lodgings;
        });
        this.eventTypes = this.settings.option.getOptionsByName('event_type')
            .then(function (response) {
                that.eventTypes = response.data || response;
            });
        this.eventThemes = this.settings.option.getOptionsByName('event_theme')
            .then(function (response) {
                that.eventThemes = response.data || response;
            });

        this.scope.$watch(function () {
            return that.media('gt-xs');
        }, function (nv) {
            that.gtXs = nv;
        });
    };
    EventCreateCtrl.prototype.filterLodgings = function (value) {
        if (!value)
            return;
        this.lodgingFiltering = true;
        var venues = angular.copy(value), self = this;
        if (venues.length > 0 && !angular.isObject(venues[0])) {
            venues.forEach(function (e, i) {
                var index = self._.findIndex(self.venues, function (v) {
                    return v.id == e;
                });
                if (index !== -1)
                    this[i] = self.venues[index];
            }, venues);
        }

        if (venues.length && venues.length > 0) {
            this.flodgings = [];
            this.lodgings.forEach(function (l) {
                if (self._.findIndex(venues, function (venue) {
                        return venue.address.country == l.address.country;
                    }) !== -1)
                    this.push(l);
            }, this.flodgings);
        } else
            this.flodgings = this.lodgings;

        this.lodgingFiltering = false;
    };
    EventCreateCtrl.prototype.isLodgingEnable = function () {
        return this.event.venues && this.event.venues.length > 0 && !this.lodgingFiltering;
    };

    EventCreateCtrl.prototype.save = function () {
        var self = this;
        this.progress = this.model.store(this.event)
            .then(function (response) {
                if (!response) {
                    self.handleMessage('Impossible d\'enregistrer "' + self.event.short_name + '"', 'danger');
                    return;
                }
                self.handleMessage('"' + self.event.short_name + '" enregistré avec succés', 'success');
                self.redirect(response.data.id || response.id);
            }, function (response) {
                console.log(response);
                if (response.status && response.status == 422) {
                    self.handleMessage("Formulaire invalide", 'warning');
                    self.$errors = response.data;
                    return;
                }
                self.handleMessage(response.statusText || 'Impossible d\'enregistrer "' + self.event.short_name + '"', 'danger')
            });
    };
    EventCreateCtrl.prototype.redirect = function (id) {
        this.state.go('admin.events.event', {id: id, action: 'edit'})
    };
    EventCreateCtrl.prototype.handleMessage = function (message, type) {
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

    EventCreateCtrl.$inject = ['$scope', '$state', 'Event', '$timeout', '$mdMedia', '$mdToast', 'Settings', '_', '$filter'];
})();