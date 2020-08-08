import $ from 'jquery';
import mapboxgl from 'mapbox-gl';
// import MapboxAreaSwitcherControl from '../dist/index';
// import LegendSymbol from '../dist/legend-symbol';
import MapboxLegendControl from '../dist/index';
import '../css/styles.css';

$(function(){
    mapboxgl.accessToken='pk.eyJ1IjoibmFyd2Fzc2NvIiwiYSI6ImNrOXIxOTFleTBvNGIzZ3A4b3docmE5cHQifQ.BqsnWbWZ2NwJZDWyOVWjXA'
    const map = new mapboxgl.Map({
        container: 'map',
        // style: 'mapbox://styles/mapbox/streets-v11',
        style:'https://narwassco.github.io/mapbox-stylefiles/unvt/style.json',
        center: [35.87063, -1.08551],
        zoom: 12,
        hash:true,
    });
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', function() {
        const targets = {
            'pipeline': 'Pipeline',
            'meter': 'Water Meter',
            'flowmeter': 'Flow Meter', 
            'valve': 'Valve', 
            'firehydrant': 'Fire Hydrant', 
            'washout': 'Washout',
            'tank': 'Tank', 
            'plant': 'Plant', 
            'parcels': 'Parcels', 
            'village': 'Village', 
            'dma': 'DMA'
        };
        map.addControl(new MapboxLegendControl(targets), 'top-right');
    });
})