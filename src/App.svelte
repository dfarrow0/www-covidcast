<script>
  import ModeNav from './components/ModeNav.svelte';
  import { onMount } from 'svelte';
  import { currentMode, appReady, sensorList } from './stores';
  import './stores/urlHandler';
  import './stores/ga';
  import { loadMetaData } from './data';
  import InfoDialog from './components/InfoDialog.svelte';

  onMount(() => {
    loadMetaData(sensorList).then(() => {
      appReady.set(true);
    });
  });

  $: currentComponent = $currentMode.component();
</script>

<style>
  .loader {
    flex-grow: 1;
  }
</style>

<ModeNav />
{#await currentComponent}
  <div class="loader loading" />
{:then value}
  <svelte:component this={value} />
{:catch error}
  <div class="loader">
    Error loading current mode
    <pre>{error}</pre>
  </div>
{/await}

<InfoDialog />
