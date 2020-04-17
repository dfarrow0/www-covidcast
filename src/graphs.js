import * as d3 from 'd3';

const barChart = 'Bar_Chart';
const lineGraph = 'Line_Graph';
const charts = [barChart, lineGraph];

let w = 400;

export class Chart {
  constructor(chartType, data) {
    console.log('chart constructor: ' + chartType);
    var chart;
    switch (chartType) {
      case 'Bar_Chart':
        console.log('bar chart');
        chart = new BarChart();
        chart.setData(data);
        break;
      case lineGraph:
        chart = new LineGraph();
        chart.setData(data);
        break;
      default:
        TypeError('Chart type not a valid type.');
    }
    return chart;
  }

  setData(data) {
    console.log('data set: ' + data);
    this.verifyDataFormat(data);
    this.data === null
      ? (this.data = data)
      : new Error('Cannot set data. Data already set. Use update method to change values.');
  }

  getData() {
    return this.data;
  }

  isChart(chart) {
    var result = null;
    chart.chartType in charts ? (result = true) : (result = false);
    return result;
  }

  verifyDataFormat() {}

  draw() {
    // size chart
    var margin = { top: 20, right: 20, bottom: 70, left: 40 },
      width = w - margin.left - margin.right,
      height = 0.75 * w - margin.top - margin.bottom;

    // parse the date time
    var parseDate = d3.timeParse('%Y-%m-%d');

    // set ranges
    this.x = d3.scaleBand().rangeRound([0, width]);
    this.y = d3.scaleLinear().range([height, 0]);

    // attach graphic
    var svg = d3
      .select(el)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // draw axes
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));
  }
}

export class BarChart extends Chart {
  // verify that the supplied data is an array of integers for a single data source
  verifyDataFormat(data) {
    console.log('bar chart');
    super.verifyDataFormat();
    !Number.isInteger(Object.values(data))
      ? TypeError('Provided data is of the wrong type. Only integers accepted.')
      : true;
    data.length > 1
      ? RangeError('Bar charts are only valid for single data sources. Comparisons are not supported.')
      : true;
    data.length < 1 ? ReferenceError('No data was provided.') : true;
  }

  draw() {
    console.log('bar chart draw');
    // size chart
    var margin = { top: 20, right: 20, bottom: 70, left: 40 },
      width = w - margin.left - margin.right,
      height = 0.75 * w - margin.top - margin.bottom;

    // parse the date time
    var parseDate = d3.timeParse('%Y-%m-%d');

    // set ranges
    var x = d3.scaleBand().rangeRound([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // attach graphic
    var svg = d3
      .select(el)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // construct the x and y domain from the data
    x.domain(
      this.getData().map(function (d) {
        return d.date;
      }),
    );
    y.domain([
      0,
      d3.max(this.getData(), function (d) {
        return d.value;
      }),
    ]);

    // fill in the bar chart according to the data
    svg
      .selectAll('bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function (d) {
        return x(d.date);
      })
      .attr('width', x.bandwidth())
      .attr('y', function (d) {
        return y(d.value);
      })
      .attr('height', function (d) {
        return height - y(d.value);
      });

    // draw axes
    svg
      .append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));
    svg.append('g').call(d3.axisLeft(y));
  }
}

export class LineGraph extends Chart {}
