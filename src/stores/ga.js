import {
  currentSensor,
  currentLevel,
  currentRegion,
  currentDate,
  signalType,
  encoding,
  currentZone,
  currentMode,
} from '.';

export function trackUrl(url) {
  if (!window.ga) {
    return;
  }
  // send an event to google analytics
  window.ga('set', 'page', url);
  window.ga('send', 'pageview');
}

export function trackEvent(category, action, label, value) {
  if (!window.ga) {
    return;
  }
  window.ga('send', 'event', category, action, label, value);
}

currentSensor.subscribe((sensor) => trackEvent('sensor', 'set', sensor));
currentLevel.subscribe((level) => trackEvent('level', 'set', level));
currentRegion.subscribe((region) => trackEvent('region', 'set', region));
currentDate.subscribe((date) => trackEvent('date', 'set', date));
signalType.subscribe((signalType) => trackEvent('signalType', 'set', signalType));
encoding.subscribe((encoding) => trackEvent('encoding', 'set', encoding));
currentZone.subscribe((zone) => trackEvent('zone', 'set', zone));
currentMode.subscribe((mode) => trackEvent('mode', 'set', mode.id));