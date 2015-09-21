'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Graph = (function () {
  function Graph() {
    _classCallCheck(this, Graph);

    this.database = new Firebase('https://kickstarter.firebaseio.com');
    this.projectTitle = '';
  }

  _createClass(Graph, [{
    key: 'init',
    value: function init() {
      this._getData();
      this._render();
      this._events();
    }
  }, {
    key: '_render',
    value: function _render() {
      this._buildGraph();
    }
  }, {
    key: '_events',
    value: function _events() {}
  }, {
    key: '_getData',
    value: function _getData() {
      var _this = this;

      var proxyURL = 'https://jsonp.afeld.me/?url=';
      var kickstarterURL = $('body').data('kickstarter');
      var pseudoApi = 'https://www.kickstarter.com/projects/search.json?search=&term=';
      var url = proxyURL + encodeURIComponent(kickstarterURL);

      // ugh, this is terrible. get the title from the url, then search for the
      // title to get some metadata
      $.getJSON(url, function (d) {
        _this.title = $(d.card).find('.project-title').text();

        $('.title').text(_this.title);
      })

      // get meta data
      .then(function () {
        var url = proxyURL + encodeURIComponent(pseudoApi + _this.title);
        $.getJSON(url, function (d) {
          window.console.log(d.projects);
          _this.metadata = d.projects[0];
        });
      });
    }
  }, {
    key: '_buildGraph',
    value: function _buildGraph() {
      var _this2 = this;

      // grab all the points available once on load
      this.database.limitToLast(24).once('value', function (event) {
        var w = $(window).width();
        var h = $(window).height();
        var data = [];
        var newItems = false;
        var recentKey = 0;
        var x, y, empty, area, graph, pct, money;

        function commaSeparateNumber(val) {
          while (/(\d+)(\d{3})/.test(val.toString())) {
            val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
          }
          return val;
        }

        // add any new points that come in after load
        _this2.database.on('value', function (event) {
          var newData = [];

          if (!newItems) {
            newItems = true;
            return;
          }

          _.each(event.val(), function (dataPiece) {
            newData.push(parseInt(dataPiece.pledged, 10));
          });

          x = d3.scale.linear().domain([0, newData.length - 1]).range([0, w]);

          y = d3.scale.linear().domain([d3.min(newData), d3.max(newData)]).range([h, 0]);

          graph.selectAll('path').datum(newData).transition().duration(1000).attr('d', area);
        });

        for (var key in event.val()) {
          if (event.val().hasOwnProperty(key)) {
            var timestamp = event.val()[key];

            // the keys are unix timestamps so the largest will be the
            // most recent
            recentKey = key > recentKey ? key : recentKey;

            // push the pledged amounts into array for graph
            data.push(parseInt(timestamp.pledged, 10));
          }
        }

        // current completion percent - value is given in decimal form
        pct = parseInt(event.val()[recentKey].percentRaised * 100, 10);
        money = event.val()[recentKey].pledged;

        x = d3.scale.linear().domain([0, data.length - 1]).range([0, w]);

        y = d3.scale.linear().domain([d3.min(data), d3.max(data)]).range([h, 0]);

        // start all points at 0 so graph animates in
        empty = d3.svg.area().interpolate('basis').x(function (d, i) {
          return x(i);
        }).y0(h).y1(function () {
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
          var _this3 = this;

          $(this).prop('counter', 0).animate({
            counter: pct
          }, {
            duration: 1000,
            easing: 'swing',
            step: function step(now) {
              $(_this3).text(parseInt(now, 10) + '%');
            }
          });
        });

        $('.money-raised').each(function () {
          var _this4 = this;

          $(this).prop('counter', 0).animate({
            counter: money
          }, {
            duration: 1000,
            easing: 'swing',
            step: function step(now) {
              $(_this4).text('$' + commaSeparateNumber(now.toFixed(0)));
            }
          });
        });
      });
    }
  }]);

  return Graph;
})();

var KickstarterTracker = (function () {
  function KickstarterTracker() {
    _classCallCheck(this, KickstarterTracker);
  }

  _createClass(KickstarterTracker, [{
    key: 'init',
    value: function init() {
      this._render();
      this._events();
    }
  }, {
    key: '_render',
    value: function _render() {
      new Graph().init();
    }
  }, {
    key: '_events',
    value: function _events() {}
  }]);

  return KickstarterTracker;
})();

new KickstarterTracker().init();
//# sourceMappingURL=index.js.map
