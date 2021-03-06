<script>
  import {
    currentSensor,
    currentLevel,
    currentDate,
    times,
    levelList,
    currentSensorEntry,
    groupedSensorList,
    isMobileDevice,
  } from '../stores';
  import Datepicker from './Calendar/Datepicker.svelte';
  import { timeFormat } from 'd3-time-format';
  import { formatAPITime, parseAPITime } from '../data';

  $: formatTime = $isMobileDevice ? timeFormat('%x') : timeFormat('%B %-d, %Y');

  export let levels = levelList;
  export let className = '';
  export let showDate = true;
  $: selectedDate = parseAPITime($currentDate);
  $: start_end_dates = [];

  $: if (selectedDate !== undefined) {
    currentDate.set(formatAPITime(selectedDate));
  }
  $: if ($times !== null) {
    start_end_dates = $times.get($currentSensor);
  }
  $: levelIds = new Set(levels.map((l) => l.id));
  $: filteredSensorGroups = groupedSensorList
    .map((g) => ({
      label: g.label,
      sensors: g.sensors.filter((d) => d.levels.some((l) => levelIds.has(l))),
    }))
    .filter((d) => d.sensors.length > 0);
</script>

<style>
  .options {
    position: relative;
    display: flex;
    margin: 0.3em;
  }

  .option-wrapper {
    align-items: center;
    display: flex;
    flex: 1 1 auto;
    max-width: 390px;
  }

  .option-title {
    margin: 0 5px;
    color: #444;
  }

  select,
  .calendar {
    background-color: #ececec;
    border-radius: 5px;
    border: none;
    color: #111;
    line-height: 1.3;
    padding: 0.4em 0.6em;
    width: 100%;
    min-width: 0;

    -moz-appearance: none;
    -webkit-appearance: none;
    appearance: none;

    transition: all 0.1s ease-in;
    flex: 1 1 auto;
    white-space: nowrap;

    padding-right: 1.7em;

    background-image: linear-gradient(45deg, transparent 50%, gray 50%),
      linear-gradient(135deg, gray 50%, transparent 50%);
    background-position: calc(100% - 15px) calc(0.85em + 0px), calc(100% - 10px) calc(0.85em + 0px);
    background-size: 5px 5px, 5px 5px;
    background-repeat: no-repeat;
  }

  .calendar:hover,
  select:hover {
    background-color: #dcdcdc;
  }

  :global(.datepicker) {
    margin: 0.25em 0;
  }

  /** mobile **/
  @media only screen and (max-width: 767px) {
    .options {
      max-width: unset;
    }
    .option-wrapper {
      padding: 0 0.1em;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: space-between;
    }
  }
</style>

<div class="options base-font-size container-bg container-style {className}">
  <div class="option-wrapper">
    <span class="option-title">Displaying</span>
    <select
      id="option-indicator"
      aria-label="indicator options"
      class="indicators base-font-size"
      bind:value={$currentSensor}>
      {#each filteredSensorGroups as sensorGroup}
        <optgroup label={sensorGroup.label}>
          {#each sensorGroup.sensors as sensor}
            <option
              title={typeof sensor.tooltipText === 'function' ? sensor.tooltipText() : sensor.tooltipText}
              value={sensor.key}>
              {sensor.name}
            </option>
          {/each}
        </optgroup>
      {/each}
    </select>
  </div>
  <div class="option-wrapper">
    <span class="option-title">for</span>
    <select
      id="option-geo-level"
      aria-label="geographic level"
      class="geo-level base-font-size"
      bind:value={$currentLevel}>
      {#each levels as level}
        <option value={level.id} disabled={!$currentSensorEntry.levels.includes(level.id)}>{level.labelPlural}</option>
      {/each}
    </select>
  </div>
  {#if showDate}
    <div class="option-wrapper">
      <span class="option-title">on</span>
      {#if selectedDate != null && start_end_dates.length !== 0}
        <Datepicker
          bind:selected={selectedDate}
          start={parseAPITime(start_end_dates[0])}
          end={parseAPITime(start_end_dates[1])}
          formattedSelected={formatTime(selectedDate)}>
          <button aria-label="selected date" class="calendar base-font-size" on:>{formatTime(selectedDate)}</button>
        </Datepicker>
      {:else}
        <button aria-label="selected date" class="calendar base-font-size" on:>{formatTime(selectedDate)}</button>
      {/if}
    </div>
  {/if}
</div>
