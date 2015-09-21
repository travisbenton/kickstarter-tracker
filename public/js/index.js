class Graph {
  constructor() {
    this.database = new Firebase('https://kickstarter.firebaseio.com');
    this.projectTitle = '';
  }
  
  init() {
    this._getData();
    this._render();
    this._events();
  }
  
  _render() {
    this._buildGraph();
  }
  
  _events() {}

  _getData() {
    var proxyURL = 'https://jsonp.afeld.me/?url=';
    var kickstarterURL = $('body').data('kickstarter');
    var pseudoApi = 'https://www.kickstarter.com/projects/search.json?search=&term=';
    var url = proxyURL + encodeURIComponent(kickstarterURL);

    // ugh, this is terrible. get the title from the url, then search for the 
    // title to get some metadata 
    $.getJSON(url, d => {
      this.title = $(d.card).find('.project-title').text();
      
      $('.title').text(this.title);
    })

    // get meta data
    .then(()=> {
      var url = proxyURL + encodeURIComponent(pseudoApi + this.title);
      $.getJSON(url, d => {
        window.console.log(d.projects);
        this.metadata = d.projects[0];
      });
    });
  }
  
  _buildGraph() {
    
    // grab all the points available once on load
    this.database.limitToLast(24).once('value', event => {  
      var w = $(window).width();
      var h = $(window).height(); 
      var data = [];
      var newItems = false;
      var recentKey = 0;
      var x, y, empty, area, graph, pct, money;
      
      function commaSeparateNumber(val){
        while (/(\d+)(\d{3})/.test(val.toString())){
          val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
        }
        return val;
      }

      // add any new points that come in after load
      this.database.on('value', event => { 
        var newData = [];

        if (!newItems) {
          newItems = true;
          return;
        }

        _.each(event.val(), dataPiece => {
          newData.push(parseInt(dataPiece.pledged, 10));
        });

        x = d3.scale.linear()
          .domain([0, newData.length - 1])
          .range([0, w]);

        y = d3.scale.linear()
          .domain([d3.min(newData), d3.max(newData)])
          .range([h, 0]);

        graph.selectAll('path')
          .datum(newData)
            .transition()
            .duration(1000)
            .attr('d', area); 
      });

      for (var key in event.val()) {
        if (event.val().hasOwnProperty(key)) {
          let timestamp = event.val()[key];

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

      x = d3.scale.linear()
        .domain([0, data.length - 1])
        .range([0, w]);

      y = d3.scale.linear()
        .domain([d3.min(data), d3.max(data)])
        .range([h, 0]);

      // start all points at 0 so graph animates in
      empty = d3.svg.area().interpolate('basis')
        .x((d, i) => { return x(i); })
        .y0(h)
        .y1(()=> { return h; });

      area = d3.svg.area().interpolate('basis')
        .x((d, i) => { return x(i); })
        .y0(h)
        .y1(d => { return y(d); });

      graph = d3.select('.graph').append('svg')
        .attr('width', w)
        .attr('height', h);

      graph.append('path')
        .datum(data)
          .attr('d', empty)
          .transition()
          .duration(1000)
          .attr('d', area);

      $('.pct-complete').each(function() {
        $(this)
          .prop('counter', 0)
          .animate({
            counter: pct
          }, {
            duration: 1000,
            easing: 'swing',
            step: now => {
              $(this).text(parseInt(now, 10) + '%');
            }
        });
      });

      $('.money-raised').each(function() {
        $(this)
          .prop('counter', 0)
          .animate({
            counter: money
          }, {
            duration: 1000,
            easing: 'swing',
            step: now => {
              $(this).text('$' + commaSeparateNumber(now.toFixed(0)));
            }
        });
      });
    });    
  }
}

class KickstarterTracker {
  constructor() {}
  
  init() {
    this._render();
    this._events();
  }
  
  _render() {
    new Graph().init();
  }
  
  _events() {}
}
new KickstarterTracker().init();