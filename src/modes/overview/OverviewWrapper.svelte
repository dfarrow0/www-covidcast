<script>
  import MapBox from '../../components/MapBox/MapBox.svelte';
  import Options from '../../components/Options.svelte';
  import FaChartLine from 'svelte-icons/fa/FaChartLine.svelte';

  import {
    signalType,
    currentSensor,
    currentLevel,
    encoding,
    colorScale,
    colorStops,
    bubbleRadiusScale,
    spikeHeightScale,
    currentRegionInfo,
    currentRegion,
    selectByInfo,
    selectByFeature,
    currentSensorEntry,
    currentDateObject,
    signalCasesOrDeathOptions,
    isMobileDevice,
    currentDate,
  } from '../../stores';
  import Search from '../../components/Search.svelte';
  import SmallMultiplesPanel from './SmallMultiplesPanel.svelte';
  import { fetchRegionSlice } from '../../data';
  import DetailView from '../../components/DetailView/DetailView.svelte';
  import MapOverlays from '../../components/MapOverlays.svelte';
  import { trackEvent } from '../../stores/ga';
  import FaBan from 'svelte-icons/fa/FaBan.svelte';
  import SingleModeToggle from '../../components/SingleModeToggle.svelte';
  import modes from '..';
  import { MAP_THEME } from '../../theme';
  import { downloadMap } from '../../data/screenshot';

  export let wrapperClass;
  export let regionSearchList;
  export let levelList;

  /**
   * @type {MapBox}
   */
  let map;

  function initialReady() {
    if (!$currentRegion) {
      map.selectRandom();
    }
  }

  function updatedEncoding(info) {
    if (!info) {
      return;
    }
    if (info.scale) {
      colorScale.set(info.scale);
    }
    colorStops.set(info.stops);
    if ($encoding === 'bubble') {
      bubbleRadiusScale.set(info.custom);
    }
    if ($encoding === 'spike') {
      spikeHeightScale.set(info.custom);
    }
  }

  /**
   * @type {import('../../data/fetchData').SensorEntry | null}
   */
  let detailSensor = null;

  let loading = true;
  $: {
    // enforce level is valid
    if (!levelList.find((d) => d.id === $currentLevel)) {
      currentLevel.set(levelList[0].id);
    }
  }
  $: data = fetchRegionSlice($currentSensorEntry, $currentLevel, $currentDateObject, {
    stderr: null,
  });

  let mobileShowMap = true;
  let desktopShowPanel = true;
  let zoom = 1;

  $: selections = $currentRegionInfo ? [{ info: $currentRegionInfo, color: MAP_THEME.selectedRegionOutline }] : [];

  function downloadHandler() {
    downloadMap({
      sensor: $currentSensor,
      level: $currentLevel,
      date: $currentDate,
      encoding: $encoding,
      signalType: $signalType,
    });
  }
</script>

<style>
  .root {
    position: relative;
    flex: 1 1 0;
    display: grid;
    grid-template-columns: 1fr min(25%, 30em) auto;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'options search view'
      'map panel panel';
    gap: 6px;
    background: var(--bg);
  }

  .root > :global(.options-container) {
    grid-area: options;
    z-index: 1010;
  }

  .root > :global(.search-container) {
    grid-area: search;
    z-index: 1009;
    margin: 0;
  }

  .map-container {
    grid-area: map;
    position: relative;
  }

  .panel-container {
    grid-area: panel;
    position: relative;
    margin-right: 6px;
  }

  .panel-scroll-container {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
  }

  .detail-container {
    position: absolute;
    right: 0;
    z-index: 1005;
    width: 100%;
    top: 20%;
    height: 60%;
    display: flex;
    flex-direction: column;
  }

  .view-switcher {
    display: flex;
    margin-right: 6px;
    grid-area: view;
  }

  .mode-container {
    position: absolute;
    margin: 6px;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }

  .map-button {
    background-size: 80%;
    background-position: center;
    background-repeat: no-repeat;
    color: transparent;
    background-image: url('../../assets/imgs/choropleth_small.png');
  }

  .chart-button {
    color: #8c8c8c;
  }

  .hiddenPanel {
    grid-template-areas:
      'options search view'
      'map map map';
  }

  .single-toggle > :global(svg:last-of-type) {
    display: none;
    position: absolute;
  }

  .single-toggle.selected > :global(svg:first-of-type) {
    opacity: 0.5;
    width: 70%;
  }
  .single-toggle.selected > :global(svg:last-of-type) {
    display: unset;
    opacity: 0.5;
  }

  /** mobile **/
  @media only screen and (max-width: 767px) {
    .root {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto 1fr;
      grid-template-areas:
        'options options'
        'search view'
        'map map';
    }
    .root > :global(.search-container) {
      margin: 0 0 0 6px;
    }

    .mobileHide {
      display: none !important;
    }

    .panel-container {
      grid-area: map;
    }
  }
</style>

<main class="root base-font-size" class:hiddenPanel={!$isMobileDevice && !desktopShowPanel}>
  <Options className="options-container" levels={levelList} />
  <Search
    className="search-container container-bg container-style"
    placeholder="Search for a location..."
    items={regionSearchList}
    selectedItem={$currentRegionInfo}
    labelFieldName="displayName"
    maxItemsToShowInList="5"
    on:change={(e) => {
      selectByInfo(e.detail);
      trackEvent('search', 'select', e.detail ? e.detail.id : '');
    }} />

  <div class="view-switcher container-bg">
    {#if !$isMobileDevice}
      <button
        aria-pressed={String(!desktopShowPanel)}
        class="pg-button chart-button single-toggle"
        class:selected={desktopShowPanel}
        on:click={() => {
          trackEvent('overview', 'show-panel', String(!desktopShowPanel));
          desktopShowPanel = !desktopShowPanel;
        }}
        title="{desktopShowPanel ? 'Hide' : 'Show'} Line Charts panel">
        <span aria-hidden>{desktopShowPanel ? 'Hide' : 'Show'} Line Charts panel</span>
        <FaChartLine />
        <FaBan />
      </button>
    {:else}
      <div class="pg-button-group">
        <button
          aria-pressed={String(mobileShowMap)}
          class="pg-button map-button"
          class:selected={mobileShowMap}
          on:click={() => {
            trackEvent('overview', 'show-map', 'true');
            mobileShowMap = true;
          }}
          title="Switch to Map">
          <span aria-hidden>Switch to Map</span>
          <FaChartLine />
        </button>
        <button
          aria-pressed={String(!mobileShowMap)}
          class="pg-button chart-button"
          class:selected={!mobileShowMap}
          on:click={() => {
            trackEvent('overview', 'show-map', 'false');
            mobileShowMap = false;
          }}
          title="Switch to Line Charts">
          <span aria-hidden>Switch to Line Charts</span>
          <FaChartLine />
        </button>
      </div>
    {/if}
  </div>

  <div class="map-container" class:mobileHide={!mobileShowMap}>
    <MapOverlays {map} mapLoading={loading} legendLoading={loading} {zoom} {downloadHandler} />
    <div class="mode-container container-bg container-style">
      <SingleModeToggle mode={modes[1]} />
    </div>
    <MapBox
      bind:this={map}
      on:loading={(e) => (loading = e.detail)}
      {data}
      sensor={$currentSensor}
      level={$currentLevel}
      signalType={$signalType}
      signalOptions={$signalCasesOrDeathOptions}
      {selections}
      encoding={$encoding}
      on:ready={() => initialReady()}
      on:zoom={(e) => (zoom = e.detail)}
      on:updatedEncoding={(e) => updatedEncoding(e.detail)}
      on:select={(e) => {
        selectByFeature(e.detail.feature, true);
        trackEvent('map', 'select', e.detail.feature.id);
      }}
      {wrapperClass} />

    {#if detailSensor != null && !$isMobileDevice && desktopShowPanel}
      <div class="detail-container container-bg container-style">
        <DetailView sensor={detailSensor} on:close={() => (detailSensor = null)} />
      </div>
    {/if}
  </div>

  {#if ($isMobileDevice && !mobileShowMap) || (!$isMobileDevice && desktopShowPanel)}
    <div class="panel-container container-bg container-style">
      <div class="panel-scroll-container">
        <SmallMultiplesPanel bind:detail={detailSensor} levels={levelList} />
      </div>
    </div>
  {/if}
</main>