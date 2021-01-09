import { IControl, Map as MapboxMap } from "mapbox-gl";
import LegendSymbol from 'legend-symbol';

type Options = {
    showDefault: Boolean;
    showCheckbox: Boolean;
}

/**
 * Mapbox GL Legend Control.
 * @param {Object} targets - Object of layer.id and title
 * @param {Boolean} options.showDefault true: it shows legend as default. false: legend will be closed as default
 * @param {Boolean} options.showCheckbox true: checkbox will be added for switching layer's visibility. false: checkbox will not be added.
 */

export default class MapboxLegendControl implements IControl
{

    private controlContainer: HTMLElement;
    private map?: MapboxMap;
    private legendContainer: HTMLElement;
    private legendButton: HTMLButtonElement;
    private closeButton: HTMLButtonElement;
    private targets: { [key: string]: string };
    private options: Options = {
        showDefault: true,
        showCheckbox: true,
    };

    constructor(targets:{ [key: string]: string }, options: Options)
    {
      this.targets = targets;
      if (options){
          this.options = Object.assign(this.options, options);
      }
      this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    public getDefaultPosition(): string
    {
        const defaultPosition = "top-right";
        return defaultPosition;
    }

    /**
     * create checkbox for switching layer visibility
     * @param layer mapboxgl.Layer object
     * @returns HTMLElement | undefined return TD Element
     */
    private createLayerCheckbox(layer: mapboxgl.Layer): HTMLElement | undefined
    {
        if (!this.options.showCheckbox) return;
        const map = this.map;

        // create checkbox for switching layer visibility
        const td = document.createElement('TD');
        td.className='legend-table-td';
        const checklayer = document.createElement('input');
        checklayer.setAttribute('type', 'checkbox');
        checklayer.setAttribute('name', layer.id);
        checklayer.setAttribute('value', layer.id);
        checklayer.checked = true;
        checklayer.addEventListener('click', function(e){
            // @ts-ignore
            const _id = e.target?.value;
            // @ts-ignore
            const _checked = e.target?.checked;
            if (_checked) {
                map?.setLayoutProperty(_id, 'visibility', 'visible');
            }else{
                map?.setLayoutProperty(_id, 'visibility', 'none');
            }
            const checkboxes: NodeListOf<HTMLElement> = document.getElementsByName(_id);
            for (let i in checkboxes){
                if (typeof checkboxes[i] === 'number') continue;
                // @ts-ignore
                checkboxes[i].checked = _checked;
            }
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
        let symbol = LegendSymbol({map: map, layer:layer});
        if (!symbol) return;
        
        var tr = document.createElement('TR');

        const td0 = this.createLayerCheckbox(layer);
        if (td0) tr.appendChild(td0);

        // create legend symbol
        var td1 = document.createElement('TD');
        td1.className='legend-table-td';
        switch(symbol.element){
            case 'div':
                if ((symbol.attributes.style.backgroundImage && symbol.attributes.style.backgroundImage !== "url(undefined)")){
                    var img = document.createElement('img');
                    img.src = symbol.attributes.style.backgroundImage.replace('url(','').replace(')','');
                    img.alt = layer.id;
                    img.style.cssText = 'height: 15px;'
                    td1.appendChild(img)      
                }else{
                    return;
                }
                td1.style.backgroundColor = symbol.attributes.style.backgroundColor;
                td1.style.backgroundPosition = symbol.attributes.style.backgroundPosition;
                td1.style.backgroundSize = symbol.attributes.style.backgroundSize;
                td1.style.opacity = symbol.attributes.style.opacity;

                break;
            case 'svg':
                let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.style.cssText = 'height: 15px;'
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

        var table = document.createElement('TABLE');
        table.className = 'legend-table';
        let layers = this.map.getStyle().layers;
        layers?.forEach(l=>{
            if ((this.targets === undefined) 
                // if target option is undefined, show all layers.
                || (this.targets && Object.keys(this.targets).length === 0) 
                // if no layer is specified, show all layers.
                || (this.targets && Object.keys(this.targets).map((id:string)=>{return id;}).includes(l.id))
                // if layers are speficied, only show these specific layers.
            ){
                const tr = this.getLayerLegend(l);
                if (!tr) return;
                table.appendChild(tr);
            }else{
                return;
            }
        })
        this.legendContainer.appendChild(table)

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

    private onDocumentClick(event: MouseEvent): void{
      if (this.controlContainer && !this.controlContainer.contains(event.target as Element) && this.legendContainer && this.legendButton) {
        if (this.options && this.options.showDefault !== true){
            this.legendContainer.style.display = "none";
            this.legendButton.style.display = "block";
        }
      }
    }
}