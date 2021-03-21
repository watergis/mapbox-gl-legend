import { accessToken, baseApiUrl, IControl, Map as MapboxMap } from "mapbox-gl";
import LegendSymbol from 'legend-symbol';
import axios from 'axios';


export type Options = {
    showDefault: boolean;
    showCheckbox: boolean;
    reverseOrder: boolean;
    onlyRendered: boolean;
}

/**
 * Mapbox GL Legend Control.
 * @param {Object} targets - Object of layer.id and title
 * @param {boolean} options.showDefault true: it shows legend as default. false: legend will be closed as default
 * @param {boolean} options.showCheckbox true: checkbox will be added for switching layer's visibility. false: checkbox will not be added.
 * @param {boolean} options.reverseOrder true: layers will be ordered from top. false: layers will be ordered from bottom. If not specified, default value will be true.
 * @param {boolean} options.onlyRendered true: only rendered layers will be shown on legend as default. false: all layers' legend will be shown as default. If not specified, default value will be true.
 */

export default class MapboxLegendControl implements IControl
{

    private controlContainer: HTMLElement;
    private map?: MapboxMap;
    private legendContainer: HTMLElement;
    private legendButton: HTMLButtonElement;
    private closeButton: HTMLButtonElement;
    private legendTable: HTMLElement;
    private targets: { [key: string]: string };
    private uncheckedLayers: { [key: string]: string } = {};
    private onlyRendered: boolean;
    private options: Options = {
        showDefault: true,
        showCheckbox: true,
        reverseOrder: true,
        onlyRendered: true,
    };
    private sprite = {
        image: HTMLImageElement,
        json: JSON
    };

    constructor(targets:{ [key: string]: string }, options: Options)
    {
      this.targets = targets;
      if (options){
          this.options = Object.assign(this.options, options);
      }
      this.onlyRendered = this.options.onlyRendered;
      this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    public getDefaultPosition(): string
    {
        const defaultPosition = "top-right";
        return defaultPosition;
    }

    private changeLayerVisibility(layer_id: string, checked)
    {
        if (checked) {
            if (this.uncheckedLayers[layer_id]) delete this.uncheckedLayers[layer_id];
            this.map?.setLayoutProperty(layer_id, 'visibility', 'visible');
        }else{
            this.uncheckedLayers[layer_id]=layer_id;
            this.map?.setLayoutProperty(layer_id, 'visibility', 'none');
        }
        const checkboxes: NodeListOf<HTMLElement> = document.getElementsByName(layer_id);
        for (let i in checkboxes){
            if (typeof checkboxes[i] === 'number') continue;
            // @ts-ignore
            checkboxes[i].checked = checked;
        }
    }

    /**
     * create checkbox for switching layer visibility
     * @param layer mapboxgl.Layer object
     * @returns HTMLElement | undefined return TD Element
     */
    private createLayerCheckbox(layer: mapboxgl.Layer): HTMLElement | undefined
    {
        if (!this.options.showCheckbox) return;
        const this_ = this;

        // create checkbox for switching layer visibility
        const td = document.createElement('TD');
        td.className='legend-table-td';
        const checklayer = document.createElement('input');
        checklayer.setAttribute('type', 'checkbox');
        checklayer.setAttribute('name', layer.id);
        checklayer.setAttribute('value', layer.id);
        const visibility = this.map?.getLayoutProperty(layer.id, 'visibility');
        if (!visibility){
            checklayer.checked = true;
        }else{
            let _checked = true;       
            switch(visibility){
                case 'none':
                    _checked = false;
                    break;
                case 'visible':
                    _checked = true;
                    checklayer.checked = true;
                    break;
            }
            this_.changeLayerVisibility(layer.id, _checked);
        }

        checklayer.addEventListener('click', function(e){
            // @ts-ignore
            const _id = e.target?.value;
            // @ts-ignore
            const _checked = e.target?.checked;
            this_.changeLayerVisibility(_id, _checked);
        });
        td.appendChild(checklayer) 

        return td;
    }

    /**
     * Create and return a layer's legend row
     * @param layer mapboxgl.Layer object
     * @returns HTMLElement | undefined return TR Element
     */
    private getLayerLegend(layer: mapboxgl.Layer): HTMLElement | undefined
    {
        const map = this.map;
        const zoom = map?.getZoom();
        const sprite = this.sprite;
        let symbol = LegendSymbol({sprite, zoom, layer});
        if (!symbol) return;
        var tr = document.createElement('TR');

        const td0 = this.createLayerCheckbox(layer);
        if (td0) tr.appendChild(td0);

        // create legend symbol
        var td1 = document.createElement('TD');
        td1.className='legend-table-td';
        switch(symbol.element){
            case 'div':
                if ((symbol.attributes.style.backgroundImage && !["url(undefined)","url(null)"].includes(symbol.attributes.style.backgroundImage))){
                    var img = document.createElement('img');
                    img.src = symbol.attributes.style.backgroundImage.replace('url(','').replace(')','');
                    img.alt = layer.id;
                    img.style.cssText = `height: 17px;`
                    td1.appendChild(img)      
                }
                td1.style.backgroundColor = symbol.attributes.style.backgroundColor;
                td1.style.backgroundPosition = symbol.attributes.style.backgroundPosition;
                td1.style.backgroundSize = symbol.attributes.style.backgroundSize;
                td1.style.backgroundRepeat = symbol.attributes.style.backgroundRepeat;
                td1.style.opacity = symbol.attributes.style.opacity;

                break;
            case 'svg':
                let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.cssText = 'height: 17px;'
                svg.setAttributeNS(null, 'version', '1.1')
                Object.keys(symbol.attributes).forEach(k=>{
                    svg.setAttribute(k, symbol.attributes[k]);
                    let group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    symbol.children.forEach(child=>{
                        var c = document.createElementNS('http://www.w3.org/2000/svg', child.element);
                        Object.keys(child.attributes).forEach(k2=>{
                            c.setAttributeNS(null, k2, child.attributes[k2]);
                        })
                        group.appendChild(c);
                    })
                    svg.appendChild(group);
                })
                var label2 = document.createElement('label');
                label2.textContent = (this.targets && this.targets[layer.id])?this.targets[layer.id]:layer.id;
                td1.appendChild(svg)
                break;
            default:
                return;
        }

        // create layer label
        var td2 = document.createElement('TD');
        td2.className='legend-table-td';
        let label1 = document.createElement('label');
        label1.textContent = (this.targets && this.targets[layer.id])?this.targets[layer.id]:layer.id;
        td2.appendChild(label1)

        // tr.appendChild(td0);
        tr.appendChild(td1);
        tr.appendChild(td2);
        return tr;
    }

    /**
    update legend contents
    */
    private updateLegendControl()
    {
        const map = this.map;

        // get current rendered layers
        const visibleLayers = {};
        if (map) {
            const features = map.queryRenderedFeatures();
            for (let feature of features) {
                visibleLayers[feature.layer.id] = feature.layer;
            }
        }

        let layers = map?.getStyle().layers;
        if (layers) {
            if (!this.legendTable){
                this.legendTable = document.createElement('TABLE');
                this.legendTable.className = 'legend-table';
                this.legendContainer.appendChild(this.legendTable)
            }
            
            while (this.legendTable.firstChild) {
                this.legendTable.removeChild(this.legendTable.firstChild);
            }
            if (this.options.reverseOrder){
                layers = layers.reverse();
            }
            layers.forEach(l=>{
                if (visibleLayers[l.id] && this.uncheckedLayers[l.id]){
                    delete this.uncheckedLayers[l.id];
                }else if (this.uncheckedLayers[l.id]) {
                    visibleLayers[l.id]=l
                };

                if ((this.targets === undefined) 
                    // if target option is undefined, show all layers.
                    || (this.targets && Object.keys(this.targets).length === 0) 
                    // if no layer is specified, show all layers.
                    || (this.targets && Object.keys(this.targets).map((id:string)=>{return id;}).includes(l.id))
                    // if layers are speficied, only show these specific layers.
                ){
                    if (this.onlyRendered){
                        // only show rendered layer
                        if (!visibleLayers[l.id]) return;
                    }
                    const tr = this.getLayerLegend(l);
                    if (!tr) return;
                    this.legendTable.appendChild(tr);
                }else{
                    return;
                }
            })
        }
    }

    public onAdd(map: MapboxMap): HTMLElement
    {
        this.map = map;
        this.controlContainer = document.createElement("div");
        this.controlContainer.classList.add("mapboxgl-ctrl");
        this.controlContainer.classList.add("mapboxgl-ctrl-group");
        this.legendContainer = document.createElement("div");
        this.legendContainer.classList.add("mapboxgl-legend-list");
        this.legendButton = document.createElement("button");
        this.legendButton.classList.add("mapboxgl-ctrl-icon");
        this.legendButton.classList.add("mapboxgl-legend-switcher");
        this.legendButton.addEventListener("click", () => {
          this.legendButton.style.display = "none";
          this.legendContainer.style.display = "block";
        });
        document.addEventListener("click", this.onDocumentClick);
        this.controlContainer.appendChild(this.legendButton);
        this.controlContainer.appendChild(this.legendContainer);
        
        this.closeButton = document.createElement("button");
        this.closeButton.textContent = "x";
        this.closeButton.classList.add("mapboxgl-legend-close-button");
        this.closeButton.addEventListener("click", () => {
            this.legendButton.style.display = "block";
            this.legendContainer.style.display = "none";
          });
        this.legendContainer.appendChild(this.closeButton);

        const legendLabel = document.createElement('label');
        legendLabel.classList.add("mapboxgl-legend-title-label");
        legendLabel.textContent = "Legend";
        this.legendContainer.appendChild(legendLabel)
        this.legendContainer.appendChild(document.createElement("br"));

        const checkOnlyRendered = document.createElement('input');
        checkOnlyRendered.setAttribute('type', 'checkbox');
        const checkboxOnlyRenderedId = `mapboxgl-legend-onlyrendered-checkbox-${Math.random()*100}`
        checkOnlyRendered.setAttribute('id', checkboxOnlyRenderedId);
        checkOnlyRendered.classList.add("mapboxgl-legend-onlyRendered-checkbox");
        checkOnlyRendered.checked = this.onlyRendered;
        const this_ = this;
        checkOnlyRendered.addEventListener('click', function(e){
            // @ts-ignore
            const _checked = e.target?.checked;
            this_.onlyRendered = (_checked)?true:false;
            this_.updateLegendControl();
        });
        this.legendContainer.appendChild(checkOnlyRendered);
        const onlyRenderedLabel = document.createElement('label');
        onlyRenderedLabel.classList.add("mapboxgl-legend-onlyRendered-label");
        onlyRenderedLabel.textContent = "Only rendered";
        onlyRenderedLabel.htmlFor = checkboxOnlyRenderedId;
        this.legendContainer.appendChild(onlyRenderedLabel);
        this.legendContainer.appendChild(document.createElement("br"));

        this.map.on('moveend', (eventData)=> {
            this.updateLegendControl();
        })
        const afterLoadListener = async() =>{
            if (map.loaded()) {
                const style = map.getStyle();
                let styleUrl = style.sprite;
                let strToken = '';
                if (styleUrl && styleUrl.includes('mapbox://')){
                    styleUrl = styleUrl
                    .replace(/mapbox:\/\//g, baseApiUrl)
                    .replace(/sprites/g,'/styles/v1');
                    styleUrl = `${styleUrl}/sprite`;
                    strToken = `?access_token=${accessToken}`;
                }
                const promise = Promise.all([
                    this.loadImage(`${styleUrl}@2x.png${strToken}`),
                    this.loadJson(`${styleUrl}.json${strToken}`),
                ]);
                await promise.then(([image, json]) => {this.setSprite(image, json)});
                this.updateLegendControl();
                map.off('idle', afterLoadListener);
            }
        }
        this.map.on('idle', afterLoadListener);
        
        if (this.options && this.options.showDefault == true){
            this.legendContainer.style.display = "block";
            this.legendButton.style.display = "none";
        }

        return this.controlContainer;
    }

    public onRemove(): void
    {
      if (!this.controlContainer || !this.controlContainer.parentNode || !this.map || !this.legendButton) {
        return;
      }
      this.legendButton.removeEventListener("click", this.onDocumentClick);
      this.controlContainer.parentNode.removeChild(this.controlContainer);
      document.removeEventListener("click", this.onDocumentClick);
      this.map = undefined;
    }

    public redraw(): void
    {
        this.updateLegendControl();
    }

    private onDocumentClick(event: MouseEvent): void{
      if (this.controlContainer && !this.controlContainer.contains(event.target as Element) && this.legendContainer && this.legendButton) {
        if (this.options && this.options.showDefault !== true){
            this.legendContainer.style.display = "none";
            this.legendButton.style.display = "block";
        }
      }
    }

    private setSprite(image, json){
        this.sprite = {
            image,
            json
        }
    }

    private loadImage(url:string){
        let cancelled = false;
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.onload = () => {
            if (!cancelled) resolve(img);
            }
            img.onerror = e => {
            if (!cancelled) reject(e);
            };
            img.src = url;
        });
        //@ts-ignore
        promise.cancel = () => {
            cancelled = true;
        }
        return promise;
    }

    private loadJson (url:string){
        return axios.get(url, { responseType: 'json'}).then(res=> res.data)
    }
}