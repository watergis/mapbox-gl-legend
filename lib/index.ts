import { IControl, Map as MapboxMap } from "mapbox-gl";
import LegendSymbol from './legend-symbol';

/**
 * Mapbox GL Legend Control.
 * @param {Object} targets - Object of layer.id and title
 */

export default class MapboxLegendControl implements IControl
{

    private controlContainer: HTMLElement;
    private map?: MapboxMap;
    private legendContainer: HTMLElement;
    private legendButton: HTMLButtonElement;
    private targets: { [key: string]: string };

    constructor(targets:{ [key: string]: string })
    {
      this.targets = targets;
      this.onDocumentClick = this.onDocumentClick.bind(this);
    }

    public getDefaultPosition(): string
    {
        const defaultPosition = "top-right";
        return defaultPosition;
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
        
        var table = document.createElement('TABLE');
        table.className = 'legend-table';
        let layers = this.map.getStyle().layers;
        layers?.forEach(l=>{
            if (!(this.targets && Object.keys(this.targets).map((id:string)=>{return id;}).includes(l.id)))return;
            let symbol = LegendSymbol({map: this.map, layer:l});
            if (!symbol) return;
            switch(symbol.element){
                case 'div':
                    let label1 = document.createElement('label');
                    label1.textContent = this.targets[l.id];
                    var tr = document.createElement('TR');
                    var td1 = document.createElement('TD');
                    if ((symbol.attributes.style.backgroundImage && symbol.attributes.style.backgroundImage !== "url(undefined)")){
                        var img = document.createElement('img');
                        img.src = symbol.attributes.style.backgroundImage.replace('url(','').replace(')','');
                        img.alt = l.id;
                        img.style.cssText = 'height: 15px;'
                        td1.appendChild(img)      
                    }else{
                        
                    }
                    td1.style.backgroundColor = symbol.attributes.style.backgroundColor;
                    td1.style.backgroundPosition = symbol.attributes.style.backgroundPosition;
                    td1.style.backgroundSize = symbol.attributes.style.backgroundSize;
                    td1.style.opacity = symbol.attributes.style.opacity;

                    var td2 = document.createElement('TD');
                    td2.appendChild(label1)
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    table.appendChild(tr);

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
                    label2.textContent = this.targets[l.id];

                    var tr = document.createElement('TR');
                    var td1 = document.createElement('TD');
                    td1.appendChild(svg)
                    var td2 = document.createElement('TD');
                    td2.appendChild(label2)
                    tr.appendChild(td1);
                    tr.appendChild(td2);
                    table.appendChild(tr);
                    break;
                default:
                    break;
            }
        })
        this.legendContainer.appendChild(table)

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
      this.legendContainer.style.display = "none";
      this.legendButton.style.display = "block";
      }
    }
}