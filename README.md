# mapbox-gl-legend
![](https://github.com/watergis/mapbox-gl-legend/workflows/Node.js%20Package/badge.svg)
![GitHub](https://img.shields.io/github/license/watergis/mapbox-gl-legend)

This module adds legend control which is able to create legend panel from mapbox style to mapbox-gl.

This module is using source code of [orangemug/legend-symbol](https://github.com/orangemug/legend-symbol). I just adopted this library to normal Mapbox GL Plugin. Thanks so much to develop this library!

## Installation:

```bash
npm i @watergis/mapbox-gl-legend --save
```

## Demo:

See [demo](https://watergis.github.io/mapbox-gl-legend/#12/-1.08551/35.87063).

## Test:

```
npm run build
npm start
```

open [http://localhost:8080](http://localhost:8080).

## Usage:

```ts
import MapboxLegendControl from "@watergis/mapbox-gl-legend";
import '@watergis/mapbox-gl-legend/css/styles.css';
import mapboxgl from 'mapbox-gl';

const map = new mapboxgl.Map();
//please add legend control after loading mapbox stylefiles, otherwise it causes errors...
map.on('load', function() {
const targets = {
        'pipeline': 'Pipeline',
        'meter': 'Water Meter',
        'flow meter': 'Flow Meter', 
        'valve': 'Valve', 
        'firehydrant': 'Fire Hydrant', 
        'washout': 'Washout',
        'tank': 'Tank', 
        'wtp': 'WTP', 
        'intake': 'Intake', 
        'parcels': 'Parcels', 
        'village': 'Village', 
        'dma': 'DMA'
};
map.addControl(new MapboxLegendControl(targets), 'top-right');
});
```

Specify your layers which you want to add the legend by the control.

## Contribution

This Mapbox GL Legend Control is still under experimental, so most welcome any feedbacks and pull request to this repository.
