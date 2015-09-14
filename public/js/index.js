'use strict';
var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor)
                descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function (Constructor, protoProps, staticProps) {
        if (protoProps)
            defineProperties(Constructor.prototype, protoProps);
        if (staticProps)
            defineProperties(Constructor, staticProps);
        return Constructor;
    };
}();
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}
var KickstarterTracker = function () {
    function KickstarterTracker() {
        _classCallCheck(this, KickstarterTracker);
    }
    _createClass(KickstarterTracker, [
        {
            key: 'init',
            value: function init() {
                this._render();
                this._events();
            }
        },
        {
            key: '_render',
            value: function _render() {
                var proxyURL = 'https://jsonp.afeld.me/?url=';
                var kickstarterURL = $('body').data('kickstarter') + '.json';
                var url = proxyURL + encodeURIComponent(kickstarterURL);
                $.getJSON(url, function (d) {
                    var title = $(d.card).find('.project-title').text();
                    $('.title').text(title);
                });
                new Graph().init();
            }
        },
        {
            key: '_events',
            value: function _events() {
            }
        }
    ]);
    return KickstarterTracker;
}();
var Graph = function () {
    function Graph() {
        _classCallCheck(this, Graph);
        this.database = new Firebase('https://kickstarter.firebaseio.com');
    }
    _createClass(Graph, [
        {
            key: 'init',
            value: function init() {
                this._render();
                this._events();
            }
        },
        {
            key: '_render',
            value: function _render() {
                this._buildGraph();
            }
        },
        {
            key: '_events',
            value: function _events() {
            }
        },
        {
            key: '_buildGraph',
            value: function _buildGraph() {
                var _this = this;
                this.database.once('value', function (event) {
                    var w = $(window).width();
                    var h = $(window).height();
                    var data = [];
                    var newItems = false;
                    var recentKey = 0;
                    var x, y, empty, area, graph, goal, pct, money;
                    function commaSeparateNumber(val) {
                        while (/(\d+)(\d{3})/.test(val.toString())) {
                            val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
                        }
                        return val;
                    }
                    _this.database.on('value', function (event) {
                        var newData = [];
                        if (!newItems) {
                            newItems = true;
                            return;
                        }
                        _.each(event.val(), function (dataPiece) {
                            newData.push(parseInt(dataPiece.pledged, 10));
                        });
                        x = d3.scale.linear().domain([
                            0,
                            newData.length - 1
                        ]).range([
                            0,
                            w
                        ]);
                        y = d3.scale.linear().domain([
                            d3.min(newData),
                            d3.max(newData)
                        ]).range([
                            h,
                            0
                        ]);
                        graph.selectAll('path').datum(newData).transition().duration(1000).attr('d', area);
                    });
                    for (var key in event.val()) {
                        var timestamp = event.val()[key];
                        recentKey = key > recentKey ? key : recentKey;
                        data.push(parseInt(timestamp.pledged, 10));
                    }
                    pct = parseInt(event.val()[recentKey].percentRaised * 100, 10);
                    money = event.val()[recentKey].pledged;
                    x = d3.scale.linear().domain([
                        0,
                        data.length - 1
                    ]).range([
                        0,
                        w
                    ]);
                    y = d3.scale.linear().domain([
                        d3.min(data),
                        d3.max(data)
                    ]).range([
                        h,
                        0
                    ]);
                    empty = d3.svg.area().interpolate('basis').x(function (d, i) {
                        return x(i);
                    }).y0(h).y1(function (d) {
                        return h;
                    });
                    area = d3.svg.area().interpolate('basis').x(function (d, i) {
                        return x(i);
                    }).y0(h).y1(function (d) {
                        return y(d);
                    });
                    graph = d3.select('.graph').append('svg').attr('width', w).attr('height', h);
                    graph.append('path').datum(data).attr('d', empty).transition().duration(1000).attr('d', area);
                    $('.pct-complete').each(function () {
                        var _this2 = this;
                        $(this).prop('counter', 0).animate({ counter: pct }, {
                            duration: 1000,
                            easing: 'swing',
                            step: function step(now) {
                                $(_this2).text(parseInt(now, 10) + '%');
                            }
                        });
                    });
                    $('.money-raised').each(function () {
                        var _this3 = this;
                        $(this).prop('counter', 0).animate({ counter: money }, {
                            duration: 1000,
                            easing: 'swing',
                            step: function step(now) {
                                $(_this3).text('$' + commaSeparateNumber(now.toFixed(0)));
                            }
                        });
                    });
                });
            }
        }
    ]);
    return Graph;
}();
new KickstarterTracker().init();