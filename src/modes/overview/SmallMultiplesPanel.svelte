<script>
  import { sensorList, currentSensor, smallMultipleTimeSpan, currentDate, currentInfoSensor } from '../../stores';
  import FaSearchPlus from 'svelte-icons/fa/FaSearchPlus.svelte';
  import { addMissing, fetchTimeSlice } from '../../data/fetchData';
  import { trackEvent } from '../../stores/ga';
  import throttle from 'lodash-es/throttle';
  import { levelList, levelMegaCounty } from '../../stores/constants';
  import SmallMultiple from './SmallMultiple.svelte';
  import IoMdHelp from 'svelte-icons/io/IoMdHelp.svelte';
  import { createSpec } from './vegaSpec';

  /**
   * bi-directional binding
   * @type {import('../../stores/constants').SensorEntry}
   */
  export let detail = null;

  export let levels = levelList;
  $: levelIds = new Set(levels.map((l) => l.id));
  $: sensors = sensorList.filter((d) => d.levels.some((l) => levelIds.has(l)));

  // use local variables with manual setting for better value comparison updates
  let startDay = $smallMultipleTimeSpan[0];
  let endDay = $smallMultipleTimeSpan[1];

  $: {
    if (startDay.getTime() !== $smallMultipleTimeSpan[0].getTime()) {
      startDay = $smallMultipleTimeSpan[0];
    }
    if (endDay.getTime() !== $smallMultipleTimeSpan[1].getTime()) {
      endDay = $smallMultipleTimeSpan[1];
    }
  }

  function fetchMulti(sensor, selections, startDay, endDay) {
    return Promise.all(
      selections.map((s) => {
        const region = s.info;
        if (region.level === levelMegaCounty.id) {
          return [];
        }
        return fetchTimeSlice(sensor, region.level, region.propertyId, startDay, endDay, false, {
          geo_value: region.propertyId,
        })
          .then(addMissing)
          .then((rows) =>
            rows.map((row) => {
              row.displayName = region.displayName;
              return row;
            }),
          );
      }),
    ).then((rows) => rows.flat());
  }

  /**
   * @type {{info: import('../../maps').NameInfo, color: string}[]}
   */
  export let selections = [];
  $: region = selections.length > 0 ? selections[0].info : null;

  $: hasRegion = selections.length > 0;
  $: multi = selections.length > 1;

  $: isMegaRegion = Boolean(region) && region.level === levelMegaCounty.id;
  $: noDataText = hasRegion ? (isMegaRegion ? `Please select a county` : 'No data available') : 'No location selected';
  $: sensorsWithData = sensors.map((sensor) => ({
    sensor,
    data: multi
      ? fetchMulti(sensor, selections, startDay, endDay)
      : region && !isMegaRegion
      ? fetchTimeSlice(sensor, region.level, region.propertyId, startDay, endDay, false, {
          geo_value: region.propertyId,
        })
          .then(addMissing)
          .then((rows) =>
            rows.map((row) => {
              row.displayName = region.displayName;
              return row;
            }),
          )
      : [],
    spec: createSpec(sensor, selections, [startDay, endDay]),
  }));

  let highlightTimeValue = null;

  const throttled = throttle((value) => {
    highlightTimeValue = value;
  }, 10);

  function onHighlight(e) {
    const highlighted = e.detail.value;
    const id = highlighted && Array.isArray(highlighted._vgsid_) ? highlighted._vgsid_[0] : null;

    if (!id) {
      throttled(null);
      return;
    }
    const row = e.detail.view.data('data_0').find((d) => d._vgsid_ === id);
    throttled(row ? row.time_value : null);
  }
  function onClick(e) {
    const item = e.detail.item;
    if (item && item.isVoronoi) {
      trackEvent('side-panel', 'set-date', item.datum.datum.time_value);
      currentDate.set(item.datum.datum.time_value);
    }
  }
</script>

<style>
  ul {
    list-style-type: none;
    padding: 0 0 0 0.25em;
  }

  .title-button {
    flex: 1 1 0;
    padding: 0;
    cursor: pointer;
    display: block;
    background: none;
    border: none;
    outline: none !important;
    text-align: left;
    color: inherit;
    font-size: 1em;
    line-height: 1.5em;
    margin: 0;
  }

  .title-button:hover,
  .title-button:focus,
  li.selected .title-button {
    color: black;
  }

  :global(#vizbox) .title-button:focus {
    box-shadow: unset !important;
  }

  .header {
    display: flex;
    padding-bottom: 0.1em;
  }

  li {
    margin: 0;
    padding: 0;
  }

  li:hover .toolbar > button,
  li.selected .toolbar > button,
  .toolbar > button:hover,
  .toolbar > button:focus {
    opacity: 1;
  }

  .toolbar {
    font-size: 0.7rem;
    display: flex;
  }
  .toolbar > button {
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  .hidden {
    display: none;
  }

  /** mobile **/
  @media only screen and (max-width: 767px) {
    ul {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-auto-flow: row;
    }
    li {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .toolbar {
      display: none;
    }
  }
</style>

<ul class="root">
  {#each sensorsWithData as s}
    <li class:selected={$currentSensor === s.sensor.key}>
      <div class="header">
        <!-- svelte-ignore a11y-missing-attribute -->
        <button
          class="title-button"
          title={typeof s.sensor.tooltipText === 'function' ? s.sensor.tooltipText() : s.sensor.tooltipText}
          on:click|preventDefault={() => {
            trackEvent('side-panel', 'set-sensor', s.sensor.key);
            currentSensor.set(s.sensor.key);
          }}>
          {typeof s.sensor.mapTitleText === 'function' ? s.sensor.mapTitleText() : s.sensor.name}
        </button>
        <div class="toolbar">
          {#if s.sensor.longDescription}
            <button
              title="Show sensor description"
              class="pg-button info"
              on:click={() => {
                currentInfoSensor.set(s.sensor);
              }}><IoMdHelp /></button>
          {/if}
          <button
            class="pg-button"
            class:hidden={!hasRegion}
            title="Show as detail view"
            class:active={detail === s.sensor}
            on:click|stopPropagation={() => {
              trackEvent('side-panel', detail === s.sensor ? 'hide-detail' : 'show-detail', s.sensor.key);
              detail = detail === s.sensor ? null : s.sensor;
            }}>
            <FaSearchPlus />
          </button>
        </div>
      </div>
      <SmallMultiple {s} {noDataText} {highlightTimeValue} {onClick} {onHighlight} />
    </li>
  {/each}
</ul>
