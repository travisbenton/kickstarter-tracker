class KickstarterGraph {
  constructor(opts) {
    this.config = opts;
    this.database = new Firebase(opts.firebase);
    this.data = [];
    this.missingData = false;
    
    this.init(opts.view);
  }
  
  init(view) {
    this.database.once('value', event => {
      this.data = event.val(); 
      this[view]();
    });
  }
  
  accumulativeTimeSeries() {
    var el = this.config.el;
    var size = d3.select(el).node().getBoundingClientRect();
    var m = { top: 20, right: 20, bottom: 30, left: 50 };
    var w = size.width - m.left - m.right;
    var h = size.height - m.top - m.bottom;
    var tooltipDateFormat = d3.time.format('%d %b %H:%M%p');
    var data = [];
    var pledgedArr = [];
    var dateArr = [];
    var missingData = [];
    var x, y, xAxis, yAxis, line, svg;
    var tooltip = d3.select('body')
        .append('div')   
        .attr('class', 'tooltip');
    
    function commaSeparateNumber(val) {
      while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1'+','+'$2');
      }
      return val;
    }
    
    for (let key in this.data) {
      if (this.data.hasOwnProperty(key) && key !== 'overview') {
        let date = new Date(key * 1000);          
        let pledged = parseInt(this.data[key].pledged, 10);
        
        data.push({ date, pledged }); 
        
        pledgedArr.push(pledged);
        dateArr.push(parseInt(key, 10));
      }
    }
    
    if (this.data.overview.launched_at < d3.min(dateArr)) {
      let date = new Date(this.data.overview.launched_at * 1000); 
      
      missingData.push({ date, pledged: 0 });
      missingData.push({ date: data[0].date, pledged: data[0].pledged });
      
      this.missingData = true;
    }
    
    x = d3.time.scale()
      .range([0, w]);

    y = d3.scale.linear()
      .range([h, 0]);

    xAxis = d3.svg.axis()
      .scale(x)
      .orient('bottom')
      .ticks(d3.time.days, 2);

    yAxis = d3.svg.axis()
      .scale(y)
      .orient('left');

    line = d3.svg.line()
      .x(d => { return x(d.date); })
      .y(d => { return y(d.pledged); });
    
    svg = d3.select(this.config.el).append('svg')
      .attr('width', w + m.left + m.right)
      .attr('height', h + m.top + m.bottom)
      .append('g')
        .attr('transform', `translate(${m.left}, ${m.top})`);
    
    if (this.missingData) {
      y.domain([0, d3.max(pledgedArr)]); 
      x.domain([missingData[0].date, new Date(dateArr[dateArr.length - 1] * 1000)]);    
    } else {
      y.domain(d3.extent(data, d => { return d.pledged; }));
      x.domain(d3.extent(data, d => { return d.date; })); 
    }    

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${h})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y axis')
      .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Contributed ($)');

    svg.append('path')
      .datum(data)
        .attr('class', 'line')
        .attr('d', line);

    svg.append('path')
      .datum(missingData)
        .style('stroke-dasharray', ('3'))
        .attr('class', 'line')
        .attr('d', line);

    svg.selectAll('dot')    
      .data(data)         
      .enter()
        .append('circle')   
        .attr('class', 'dot')
        .attr('r', 0)       
        .attr('cy', d => { return y(d.pledged); })     
        .attr('cx', d => { return x(d.date); })
        .on('mouseover', function(d) {  
          d3.select(this)
            .transition()
            .duration(200)
            .style('r', 5);
      
          tooltip
            .html(`
              ${tooltipDateFormat(d.date)}<br/>
              $${commaSeparateNumber(d.pledged)}
            `)
            .style('opacity', 1)
            .style('pointer-events', 'all')
            .style('left', `${x(d.date) - 75}px`)     
            .style('top', `${y(d.pledged) - 2}px`);
         })                  
        .on('mouseout', function() {       
          d3.select(this)
            .transition()
            .duration(200)
            .style('r', 0);
      
          tooltip
            .style('opacity', 0)
            .style('pointer-events', 'none');
        });
  }
}

new KickstarterGraph({
  el: '.graph',
  firebase: process.env.firebase_url,
  view: 'accumulativeTimeSeries'
});