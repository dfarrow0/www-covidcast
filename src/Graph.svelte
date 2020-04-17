<script>
  import { onMount } from 'svelte';
  import { selectedRegion, currentSensor, currentLevel, currentData } from './stores.js';
  import { Chart, LineGraph, BarChart } from './graphs.js';
  import * as d3 from 'd3';

  let el;
  let w;

  // the $ syntax just says, if w is changed, run drawGraph() - e.g. redraw the graph when the window is resized.
  // $: w, drawGraph();

  // local variables for permissible graph types
  const barChart = 'Bar_Chart';
  const lineGraph = 'Line_Graph';
  const charts = [barChart, lineGraph];
  let userCharts = [];

  // This subscribes to sample data to redraw the graph every time the data changes.
  selectedRegion.subscribe(_ => updateGraph());
  onMount(_ => drawGraph());

  function drawGraph() {
    console.log('draw graph');
    let chart = new Chart(barChart, {});
    chart.draw();
    userCharts.push(chart);
  }

  function updateGraph() {
    console.log('update');
    if (userCharts.length > 0) {
      userCharts[0].draw();
    }
  }

  // parse data
  function getData() {
    console.log('get data');
    let data = $currentData;
    let region = $selectedRegion;
    console.log(data['0']);
    console.log(region);

    // search for the ID
    let id = $selectedRegion.GEO_ID;
    let re = new RegExp('US[0-9]+');
    let geo = re.exec(id);
    let graphData = data[geo];
    console.log(graphData);
    // todo: finish parsing data
    // if(geo) {}
    // console.log(currentSensor);
    // console.log(currentLevel);

    return graphData, barChart;
  }
</script>

<p>cool line graph with options</p>
<p>
  currently viewing sensor
  <b>{$currentSensor}</b>
  at level
  <b>{$currentLevel}</b>
  for
  <b>{$selectedRegion}</b>
</p>

<!-- bind:this sets the variable el to the HTML div you can then select using d3 as above-->
<div bind:clientWidth={w}>
  <div bind:this={el} />
</div>
