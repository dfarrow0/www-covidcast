import 'mapbox-gl/dist/mapbox-gl.css';
import { bounds, loadSWPASources } from '../../maps';
import { swpaLevels } from '../../stores/constants';
import { MAP_THEME } from '../../theme';
import AMapBoxWrapper from './AMapBoxWrapper';
import { ChoroplethEncoding } from './encodings';
import { L } from './layers';
import { toBorderSource, valueProperties } from './sources';

const geoJsonSources = loadSWPASources(valueProperties);

export default class USMapBoxWrapper extends AMapBoxWrapper {
  /**
   *
   * @param {(type: string, data: any) => void} dispatch
   * @param {MapBoxWrapperOptions} options
   */
  constructor(dispatch) {
    super(dispatch, {
      bounds: bounds.hrr,
      encodings: [
        new ChoroplethEncoding(),
        // new BubbleEncoding(ENCODING_BUBBLE_THEME),
        // new SpikeEncoding(ENCODING_SPIKE_THEME),
      ],
      level: 'county',
      levels: swpaLevels,
      hasMegaCountyLevel: false,
    });
  }

  addLevelSources() {
    return geoJsonSources.then((r) => {
      this.map.addSource(toBorderSource('hrr'), {
        type: 'geojson',
        data: r.hrr,
      });
      this.levels.forEach((level) => {
        this.addLevelSource(level, r[level].border, r[level].center);
      });
    });
  }

  addSources() {
    return this.addLevelSources().then(() => {
      for (const enc of this.encodings) {
        enc.addSources(this.map, this);
      }
    });
  }

  addLayers() {
    const map = this.map;
    map.addLayer({
      id: L.outline,
      source: toBorderSource('hrr'),
      type: 'fill',
      paint: {
        'fill-color': MAP_THEME.stateFill,
        'fill-outline-color': MAP_THEME.stateOutline,
      },
    });

    this.levels.forEach((level) => {
      this.addLevelLayer(level);
    });
    this.encodings.forEach((enc) => {
      enc.addLayers(map, this);
    });
  }
}
