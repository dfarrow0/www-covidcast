import merge from 'lodash-es/merge';
/**
 * @type {import('vega-lite/build/src/spec').LayerSpec | import('vega-lite/build/src/spec').UnitSpec}
 */
export const CURRENT_DATE_HIGHLIGHT = {
  description: 'shows the current data injected via a signal, y: null is on purpose to invalidate a global y',
  data: {
    values: [{ date_value: null }],
  },
  transform: [
    {
      calculate: 'toDate(currentDate)',
      as: 'date_value',
    },
  ],
  mark: 'rule',
  encoding: {
    color: {
      value: '#c00',
    },
    x: {
      field: 'date_value',
      type: 'temporal',
    },
    y: null,
  },
};

/**
 * @type {import('vega-lite/build/src/spec').LayerSpec | import('vega-lite/build/src/spec').UnitSpec}
 */
export const stdErrLayer = {
  mark: {
    type: 'area',
    interpolate: 'monotone',
  },
  encoding: {
    color: {
      field: 'geo_value',
    },
    opacity: {
      value: 0.25,
    },
    y: {
      field: 'value_lower_bound',
      type: 'quantitative',
    },
    y2: {
      field: 'value_upper_bound',
    },
  },
};

/**
 * @type {import('vega-lite/build/src/transform').Transform[]}
 */
export const stdErrTransform = [
  {
    calculate: 'datum.value == null ? null : datum.value - datum.stderr',
    as: 'value_lower_bound',
  },
  {
    calculate: 'datum.value == null ? null : datum.value + datum.stderr',
    as: 'value_upper_bound',
  },
];

export const xDateEncoding = {
  field: 'date_value',
  type: 'temporal',
  axis: {
    title: null,
    format: '%m/%d',
    formatType: 'time',
    tickCount: 'day',
    grid: false,
  },
};

/**
 * @param {{info: import('../../maps').NameInfo, color: string}[]} selections
 */
export function colorEncoding(selections) {
  if (!selections) {
    return {
      value: 'grey',
    };
  }
  return {
    field: 'geo_value',
    type: 'nominal',
    scale: {
      domain: selections.map((d) => d.info.propertyId),
      range: selections.map((d, i) => (i === 0 ? 'grey' : d.color)),
    },
  };
}

/**
 * @param {import('../../data').SensorEntry} sensor
 * @param {string} primaryValue
 * @param {{info: import('../../maps').NameInfo, color: string}[]} selections
 * @param {[Date, Date]} initialSelection
 */
export function createSpec(sensor, primaryValue, selections, initialSelection) {
  /**
   * @type {import('vega-lite').TopLevelSpec}
   */
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
    data: { name: 'values' },
    autosize: {
      contains: 'padding',
      resize: true,
    },
    transform: sensor.hasStdErr ? stdErrTransform : [],
    vconcat: [
      {
        width: 'container',
        encoding: {
          x: {
            ...xDateEncoding,
            scale: { domain: { selection: 'brush' } },
          },
          y: {
            field: primaryValue,
            type: 'quantitative',
            axis: {
              minExtent: 25,
              title: sensor.yAxis,
            },
          },
        },
        layer: [
          {
            mark: {
              type: 'line',
              interpolate: 'monotone',
            },
            encoding: {
              color: colorEncoding(selections),
            },
          },
          {
            selection: {
              highlight: {
                type: 'single',
                empty: 'none',
                nearest: true,
                on: 'mouseover',
                clear: 'mouseout',
              },
            },
            mark: {
              type: 'circle',
              tooltip: true,
            },
            encoding: {
              color: {
                field: 'geo_value',
              },
            },
          },
          // complicated construct to have proper typings
          ...(sensor.hasStdErr ? [stdErrLayer] : []),
          {
            transform: [
              {
                filter: {
                  selection: 'highlight',
                },
              },
            ],
            mark: 'rule',
          },
          CURRENT_DATE_HIGHLIGHT,
        ],
      },
      {
        height: 40,
        encoding: {
          color: {
            field: 'geo_value',
          },
          x: { ...xDateEncoding },
          y: {
            field: primaryValue,
            type: 'quantitative',
            axis: {
              minExtent: 25,
              tickCount: 3,
              title: ' ',
            },
          },
        },
        layer: [
          {
            selection: {
              highlight2: {
                type: 'single',
                empty: 'none',
                nearest: true,
                on: 'mouseover',
                clear: 'mouseout',
              },
              brush: {
                type: 'interval',
                encodings: ['x'],
                init: {
                  x: [initialSelection[0].getTime(), initialSelection[1].getTime()],
                },
              },
            },
            mark: {
              type: 'line',
              interpolate: 'monotone',
            },
          },
          // complicated construct to have proper typings
          ...(sensor.hasStdErr ? [stdErrLayer] : []),
          {
            transform: [
              {
                filter: {
                  selection: 'highlight2',
                },
              },
            ],
            mark: 'rule',
          },
          CURRENT_DATE_HIGHLIGHT,
        ],
      },
    ],
    config: {
      legend: {
        disable: true,
      },
    },
  };

  if (sensor.isCasesOrDeath) {
    // patch in the the cases / death count lines
    const casesCountLine = {
      mark: {
        type: 'line',
        interpolate: 'monotone',
        opacity: 0.2,
      },
      encoding: {
        y: {
          field: primaryValue.replace('avg', 'count'),
        },
        color: {
          field: 'geo_value',
        },
      },
    };
    spec.vconcat[0].layer.unshift(casesCountLine);
    spec.vconcat[1].layer.unshift(casesCountLine);
  }

  return spec;
}

const OFFSET_X = 60;
const OFFSET_Y = 80;

/**
 * patches in the current size
 * @param {import('vega-lite').TopLevelSpec} spec
 * @param {{width: number, height: number}} size
 */
export function patchSpec(spec, size) {
  return merge({}, spec, {
    vconcat: [
      {
        width: size.width - OFFSET_X,
        height: size.height - 40 - OFFSET_Y,
      },
      {
        width: size.width - OFFSET_X,
        height: 40,
      },
    ],
  });
}
