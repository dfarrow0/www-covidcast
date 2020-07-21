export function isCountSignal(signal) {
  return signal.match(/num/);
}

export function isDeathSignal(signal) {
  const deathsRegex = /deaths_/;
  return signal.match(deathsRegex);
}

export function isCasesSignal(signal) {
  const casesRegex = /confirmed_/;
  return signal.match(casesRegex);
}
