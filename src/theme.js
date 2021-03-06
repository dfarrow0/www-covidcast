const colorDecreasing = 'rgb(86,157,201)'; //''rgb(0,223,252)'//'#badee8';
const colorSteady = 'rgb(220, 220, 220)'; // 'rgb(249,212,35)' //'#f2df91';
const colorIncreasing = 'rgb(218,107,87)'; //rgb(255,78,80)' //'#ce0a05';

const colorDecreasingMega = 'rgba(86,157,201,0.5)'; //'#badee8';
const colorSteadyMega = 'rgba(220, 220, 220,0.5)'; //'#f2df91';
const colorIncreasingMega = 'rgba(218,107,87, 0.5)'; //'#ce0a05';

export const DIRECTION_THEME = {
  increasing: colorIncreasing, //color_high,
  steady: colorSteady, //color_medium,
  decreasing: colorDecreasing, //color_low,
  increasingIcon: '&#9650;',
  steadyIcon: '&#9644;',
  decreasingIcon: '&#9660;',
  max: colorIncreasing, //color_high,
  countMin: 'rgb(242,242,242)',
  gradientMin: colorDecreasing,
  gradientMiddle: colorSteady,
  gradientMax: colorIncreasing,
  gradientMinMega: colorDecreasingMega,
  gradientMiddleMega: colorSteadyMega,
  gradientMaxMega: colorIncreasingMega,
};

export const MISSING_COLOR = '#eeeeee';
export const ZERO_COLOR = 'rgb(242,242,242)';

export const MAP_THEME = {
  selectedRegionOutline: '#333333', //'#000000',
  hoverRegionOutline: '#cccccc', //'#ffffff',
  stateFill: 'rgba(0, 0, 0, 0)',
  stateOutline: '#ffffff', //'#bcbcbc',
  countyFill: '#eeeeee', //'#e4dac4', // missing value
  countyOutline: '#ffffff', //'#e0e0e0',
  countyOutlineWhenFilled: '#ffffff', //'#616161',
  zoneOutline: 'blue', //'#e0e0e0',
};

export const selectionColors = ['#0F0589', '#16A997', '#A71808', '#CD22B2', '#F58B29'];

export const ENCODING_BUBBLE_THEME = {
  color: 'transparent',
  countyFill: '#eeeeee',
  strokeColor: '#666',
  strokeWidth: 1,
  strokeWidthHighlighted: 4,
  fillOpacity: 0.5,
  strokeOpacity: 1,
  minRadius: {
    county: 2,
    msa: 3,
    state: 6,
  },
  maxRadius: {
    county: 6,
    msa: 10,
    state: 20,
  },
  radiusScale: {
    count: {
      type: 'sqrt', // one of ['sqrt', 'log', 'linear']
    },
    prop: {
      type: 'linear',
    },
    other: {
      type: 'linear',
    },
  },
};

export const ENCODING_SPIKE_THEME = {
  fillOpacity: 0.2,
  countyFill: '#eeeeee',
  strokeOpacity: 1,

  maxHeight: {
    county: 20,
    msa: 40,
    state: 80,
  },
  size: {
    county: 4,
    msa: 8,
    state: 16,
  },
  heightScale: {
    count: {
      type: 'sqrt',
    },
    prop: {
      type: 'linear',
    },
    other: {
      type: 'linear',
    },
  },
};
