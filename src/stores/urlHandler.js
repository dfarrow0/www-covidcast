import { currentSensor, currentLevel, currentRegion, currentDate, signalType, encoding, currentZone } from '.';
import { get } from 'svelte/store';

// Constantly keep the URL parameters updated with the current state.
function updateURIParameters(delta) {
  const state = {
    sensor: get(currentSensor),
    level: get(currentLevel),
    region: get(currentRegion),
    date: get(currentDate),
    signalType: get(signalType),
    encoding: get(encoding),
    zone: get(currentZone),
    ...delta, // inject current delta
  };

  // just update the current state
  const params = new URLSearchParams(window.location.search);

  // update params with state
  Object.keys(state).forEach((key) => {
    const v = state[key];
    if (v) {
      params.set(key, v);
    } else {
      params.delete(key);
    }
  });
  window.history.replaceState(state, document.title, `?${params.toString()}`);
}

// Keep the URL updated with the current state
currentSensor.subscribe((sensor) =>
  updateURIParameters({
    sensor,
  }),
);
currentLevel.subscribe((level) =>
  updateURIParameters({
    level,
  }),
);
currentRegion.subscribe((region) => updateURIParameters({ region }));
currentDate.subscribe((date) => updateURIParameters({ date }));
signalType.subscribe((signalType) =>
  updateURIParameters({
    signalType,
  }),
);
encoding.subscribe((encoding) => updateURIParameters({ encoding }));
currentZone.subscribe((zone) =>
  updateURIParameters({
    zone,
  }),
);