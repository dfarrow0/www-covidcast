<script>
  import { encoding, isValueSignalType } from '../stores';
  import IoMdAdd from 'svelte-icons/io/IoMdAdd.svelte';
  import IoMdRemove from 'svelte-icons/io/IoMdRemove.svelte';
  import IoMdHome from 'svelte-icons/io/IoMdHome.svelte';
  import { trackEvent } from '../stores/ga';

  export let className = '';

  /**
   * @type {import('./MapBox/ZoomMap').default}
   */
  export let zoom;

  export let showEncodings = false;
  export let loading = false;

  const encodings = [
    ['color', 'Choropleth'],
    ['bubble', 'Bubble Map'],
    ['spike', 'Spike Map'],
  ];
</script>

<style>
  .root {
    display: flex;
    flex-direction: column;
  }

  .root > div {
    margin-bottom: 0.2em;
  }

  .encoding-button {
    background-size: 80%;
    background-position: center;
    background-repeat: no-repeat;
    color: transparent;
  }

  .color {
    background-image: url('../assets/imgs/choropleth_small.png');
  }
  .bubble {
    background-image: url('../assets/imgs/bubble_small.png');
  }
  .spike {
    background-image: url('../assets/imgs/spike_small.png');
  }

  .loader {
    min-width: 28px;
    min-height: 28px;
    overflow: hidden;
  }
</style>

<div class="root base-font-size {className}">
  <div class="pg-button-vertical-group">
    <button
      class="pg-button"
      type="button"
      title="Zoom in"
      aria-label="Zoom in"
      disabled={!zoom || zoom.getZoom() <= zoom.getMinZoom()}
      on:click={() => {
        trackEvent('map', 'zoomIn');
        zoom.zoomIn();
      }}>
      <IoMdAdd />
    </button>
    <button
      class="pg-button"
      type="button"
      title="Zoom out"
      aria-label="Zoom out"
      disabled={!zoom || zoom.getZoom() >= zoom.getMaxZoom()}
      on:click={() => {
        trackEvent('map', 'zoomOut');
        zoom.zoomOut();
      }}>
      <IoMdRemove />
    </button>
  </div>
  <div>
    <button
      class="pg-button"
      type="button"
      title="Show entire map"
      aria-label="Show entire map"
      disabled={!zoom}
      on:click={() => {
        trackEvent('map', 'zoomReset');
        zoom.resetZoom();
      }}>
      <IoMdHome />
    </button>
  </div>
  {#if showEncodings && $isValueSignalType}
    <div class="pg-button-vertical-group">
      {#each encodings as enc}
        <button
          aria-pressed={String($encoding === enc[0])}
          class="pg-button encoding-button {enc[0]}"
          class:selected={$encoding === enc[0]}
          on:click={() => {
            encoding.set(enc[0]);
          }}
          title="Switch to {enc[1]}">
          <span aria-hidden>Switch to {enc[1]}</span>
          <IoMdHome />
        </button>
      {/each}
    </div>
  {/if}
  {#if loading}
    <div class="loader loading" />
  {/if}
</div>
