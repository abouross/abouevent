(function () {

    angular
        .module('AbouEventAdmin')
        .controller('DashboardCtrl', ['$scope', 'Event',
            DashboardCtrl
        ])
        .controller('LastEventsCtrl', LastEventsCtrl)
        .controller('StateCtrl', StateCtrl)
        .controller('CourbeCtrl', CourbeCtrl);

    function DashboardCtrl($scope, Event) {

        $scope.publishedParams = {'filter[published]': 1};
        $scope.runningParams = angular.extend({'filter[published]': 1},
            Event.parseFilter({
                status: {
                    start_date: {value: 'now', op: '<=', type: 'datetime'},
                    end_date: {value: 'now', op: '>=', type: 'datetime'}
                }
            })
        );

    }

    function LastEventsCtrl($scope, Event, _) {
        this.scope = $scope;
        this.model = Event;
        this._ = _;
        this.filter = {
            criteria: null,
            published: null
        };
        this.perPage = 6;
        this.lastQuery = null;
        this.refresh();
    }

    LastEventsCtrl.prototype.refresh = function () {
        if (this.progress || !this.perPage)
            return;
        var params = {
            "pagination[perPage]": this.perPage,
            "pagination[page]": 1
        };

        //params['sort[id]'] = 'desc';
        params['sort[created_at]'] = 'desc';

        if (this.filter.criteria) {
            this.subtitle = this.filter.criteria.title;
            var criteria = {status: angular.copy(this.filter.criteria)};
            delete criteria.status.title;
            criteria = this.model.parseFilter(criteria);
            params = this._.assign(params, criteria)
        } else
            this.subtitle = null;

        if (this.filter.published)
            params = this._.assign(params, this.model.parseFilter(this.filter.published));

        var query = JSON.stringify(params);
        if (query == this.lastQuery) return;
        this.lastQuery = query;
        var that = this;
        this.progress = this.model.loadByPagination(params)
            .then(function (response) {
                response = response.data || response;
                that.events = response.data;
                that.progress = false;
            });
    };

    LastEventsCtrl.$inject = ['$scope', 'Event', '_'];

    /*** State *****/
    function StateCtrl($scope, Event, _) {
        this.scope = $scope;
        this.model = Event;
        this._ = _;
        this.filter = null;
        this.filterData = {
            not_started: {
                start_date: {value: 'now', op: '>', type: 'datetime'}
            },
            running: {
                start_date: {value: 'now', op: '<=', type: 'datetime'},
                end_date: {value: 'now', op: '>=', type: 'datetime'}
            },
            ended: {
                end_date: {value: 'now', op: '<', type: 'datetime'}
            }
        };

        this.options = {
            chart: {
                type: 'pieChart',
                height: 210,
                donut: true,
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.y;
                },
                valueFormat: (d3.format(".0f")),
                showLabels: true,
                showLegend: false,
                title: '',
                margin: {top: -10}
            }
        };
        this.api = null;

        this.refresh();
    }

    StateCtrl.prototype.refresh = function () {
        if (this.progress)
            return;

        this.progress = true;
        var data = [];

        if (this.filter == null)
            this.options.chart.title = 'Totale';
        else
            this.options.chart.title = this.filter.published ? 'Publiés' : 'Non Publiés';

        var progresses = 0, self = this, fin = function () {
            progresses--;
            if (progresses == 0) {
                var count = 0;
                if (data.length > 0) {
                    data.forEach(function (d) {
                        count += d.y;
                    });
                }
                self.options.chart.title = count + ' ' + self.options.chart.title;
                self.progress = false;
                self.chartData = data;
                self.chartOptions = self.options
            }
        };

        progresses++;
        var params = this.model.parseFilter(this._.assign(this.filter || {}, {status: this.filterData.not_started}));
        this.model.count(params)
            .then(function (response) {
                if (response.data.count > 0)
                    data.push({key: '1', label: 'Non commencés', y: response.data.count, color: '#22A7F0'});
            })
            .finally(fin);

        progresses++;
        params = this.model.parseFilter(this._.assign(this.filter || {}, {status: this.filterData.running}));
        this.model.count(params)
            .then(function (response) {
                if (response.data.count > 0)
                    data.push({key: '2', label: 'En cours', y: response.data.count, color: 'rgb(0, 150, 136)'});
            })
            .finally(fin);

        progresses++;
        params = this.model.parseFilter(this._.assign(this.filter || {}, {status: this.filterData.ended}));
        this.model.count(params)
            .then(function (response) {
                if (response.data.count > 0)
                    data.push({key: '3', label: 'Terminés', y: response.data.count, color: '#E75753'});
            })
            .finally(fin);
    };

    StateCtrl.$inject = ['$scope', 'Event', '_'];

    /*** Courbe *****/
    function CourbeCtrl($scope, Event, _, $filter) {
        this.scope = $scope;
        this.model = Event;
        this._ = _;
        this.filter = $filter;

        this.options = {
            chart: {
                type: 'lineChart',
                height: 210,
                margin: {top: 30, right: 10, bottom: 30, left: 10},
                x: function (d) {
                    if (angular.isString(d.x))
                        return Date.parse(d.x);
                    return d.x;
                },
                y: function (d) {
                    return d.y
                },
                showLabels: false,
                showLegend: true,
                title: 'Evolutions',
                showYAxis: false,
                showXAxis: false,
                tooltip: {
                    contentGenerator: function (d) {
                        var date = angular.isNumber(d.point.x) ? $filter('date')(new Date(d.point.x)) : d.point.x;
                        return '<span class="custom-tooltip">' + d.point.y + ' - ' + date + '</span>'
                    }
                }
            }
        };

        this.refresh();
    }

    CourbeCtrl.prototype.refresh = function () {
        if (this.progress)
            return;

        this.progress = true;
        var data = [], progresses = 0, self = this, fin = function () {
            progresses--;
            if (progresses == 0) {
                self.progress = false;
                self.chartData = data;
                self.chartOptions = self.options
            }
        };

        progresses++;
        var params = {};
        this.model.groups(params)
            .then(function (response) {
                var values = [], count = 0;
                response.data.data.forEach(function (e, i) {
                    var nb = parseInt(e.count, 10);
                    count += nb;
                    this.push({y: nb, x: e.fcreated_at})
                }, values);
                data.push({values: values, color: '#22A7F0', area: true, key: 'Totale :' + count})
            })
            .finally(fin);

        progresses++;
        params = this.model.parseFilter({published: true});
        this.model.groups(params)
            .then(function (response) {
                var values = [], count = 0;
                response.data.data.forEach(function (e, i) {
                    var nb = parseInt(e.count, 10);
                    count += nb;
                    this.push({y: nb, x: e.fcreated_at})
                }, values);
                data.push({values: values, color: '#1ABC9C', area: true, key: 'Publié: ' + count})
            })
            .finally(fin);

        progresses++;
        params = this.model.parseFilter({published: false});
        this.model.groups(params)
            .then(function (response) {
                var values = [], count = 0;
                response.data.data.forEach(function (e, i) {
                    var nb = parseInt(e.count, 10);
                    count += nb;
                    this.push({y: nb, x: e.fcreated_at})
                }, values);
                data.push({values: values, color: '#FFB400', area: true, key: 'Non Publié: ' + count})
            })
            .finally(fin);

    };

    CourbeCtrl.$inject = ['$scope', 'Event', '_', '$filter'];

})();
