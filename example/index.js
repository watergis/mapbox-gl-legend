import $ from 'jquery';
import mapboxgl from 'mapbox-gl';
// import MapboxAreaSwitcherControl from '../dist/index';
// import LegendSymbol from '../dist/legend-symbol';
import MapboxLegendControl from '../dist/index';
import '../css/styles.css';

$(function(){
    // mapboxgl.accessToken='your mapbox access token'
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
            'pipeline_annotation': 'Pipeline Label', 
            'meter': 'Water Meter',
            'flow meter': 'Flow Meter', 
            'valve': 'Valve', 
            'firehydrant': 'Fire Hydrant', 
            'washout': 'Washout',
            'tank': 'Tank', 
            'tank_annotation': 'Tank Label', 
            'wtp': 'WTP', 
            'wtp_annotation': 'WTP Label', 
            'intake': 'Intake', 
            'intake_annotation': 'Intake Label', 
            'parcels': 'Parcels', 
            'parcels_annotation': 'Parcels Label', 
            'village': 'Village', 
            'village_annotation': 'Village Label', 
            'dma': 'DMA',
            'dma-annotation': 'DMA Label', 
            'contour-line': 'Countour',
            'contour-label': 'Contour Label',
            'hillshade': 'Hillshade'
        };
        // add legend control without checkbox, and it will be hide as default
        map.addControl(new MapboxLegendControl(targets, {showDefault: false, showCheckbox: false, onlyRendered: false}), 'top-right');

        // add legend control with checkbox, and it will be shown as default
        map.addControl(new MapboxLegendControl(targets, {showDefault: true}), 'bottom-right');

        // add legend control with all layers, and it reverse layer order
        map.addControl(new MapboxLegendControl({}, {reverseOrder: false}), 'bottom-left');
    });
})