/**
 * Created by abou on 30/05/17.
 */

(function () {
    'use strict';
    angular.module('AbouEventAdmin')
        .controller('EventCtrl', EventCtrl);
    function EventCtrl($scope, $stateParams, Event, $timeout, Settings, $mdMedia, $mdToast, _, $filter) {
        this.scope = $scope;
        this.toast = $mdToast;
        this.id = $stateParams.id;
        this.action = $stateParams.action;
        this.preview = this.action == 'preview';
        this.model = Event;
        this.event = null;
        this.realEvent = null;
        this.venues = [];
        this.lodgings = [];
        this.settings = Settings;
        this.progress = null;
        this.actionOpen = false;
        this.timeout = $timeout;
        this.media = $mdMedia;
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

    EventCtrl.prototype.init = function () {
        this.isEvent = true;
        this.scope.$parent.ctrl = this;
        var that = this;
        this.timeout(function () {
            if (!that.actionOpen)
                that.toggleActions();
            that.timeout(function () {
                if (that.actionOpen)
                    that.toggleActions();
            }, 5000)
        }, 500);
        this.progress = this.model.get(this.id)
            .then(function (response) {
                that.setEvent(response);
            });

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

    EventCtrl.prototype.setEvent = function (response) {
        this.realEvent = response.data || response;

        var event = angular.copy(this.realEvent);
        angular.forEach(event.venues, function (item, pos) {
            this[pos] = item.id;
        }, event.venues);
        angular.forEach(event.lodgings, function (item, pos) {
            this[pos] = item.id;
        }, event.lodgings);
        event.image = event.image ? event.image.id || event.image : null;
        event.eventType = event.eventType ? event.eventType.id || event.eventType : null;
        event.eventTheme = event.eventTheme ? event.eventTheme.id || event.eventTheme : null;

        delete event.created_at;
        delete event.updated_at;
        delete event.event_theme_id;
        delete event.event_type_id;
        delete event.id;
        delete event.image_id;
        delete event.status;
        delete event.status_code;
        delete event.slug;

        this.event = event;


    };

    EventCtrl.prototype.filterLodgings = function (value) {
        if (!value || !angular.isArray(this.lodgings))
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
    EventCtrl.prototype.isLodgingEnable = function () {
        if (!this.event)
            return false;
        return this.event.venues && this.event.venues.length > 0 && !this.lodgingFiltering;
    };

    EventCtrl.prototype.toggleActions = function () {
        this.actionOpen = !this.actionOpen;
    };
    EventCtrl.prototype.save = function () {
        var self = this;
        this.progress = this.model.update(this.realEvent.id, this.event)
            .then(function (response) {
                if (!response)
                    self.handleMessage('Impossible d\'enregistrer "' + self.event.short_name + '"', 'danger');
                self.handleMessage('"' + self.event.short_name + '" enregistré avec succés', 'success');
                self.setEvent(response);
            }, function (response) {
                self.handleMessage(response.statusText || 'Impossible d\'enregistrer "' + self.event.short_name + '"', 'danger')
            });
    };
    EventCtrl.prototype.handleMessage = function (message, type) {
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

    EventCtrl.$inject = ['$scope', '$stateParams', 'Event', '$timeout', 'Settings', '$mdMedia', '$mdToast', '_', '$filter'];
})();
