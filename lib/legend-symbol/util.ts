import {
  expression,
  latest,
  function as styleFunction
} from '@mapbox/mapbox-gl-style-spec';


const PROP_MAP = [
  ["background"],
  ["circle"],
  ["fill-extrusion"],
  ["fill"],
  ["heatmap"],
  ["hillshade"],
  ["line"],
  ["raster"],
  ["icon", "symbol"],
  ["text", "symbol"],
];

export function exprHandler (map) {
  const zoom = map.getZoom();


  function prefixFromProp (prop) {
    const out = PROP_MAP.find(def => {
      const type = def[0];
      return prop.startsWith(type);
    });
    return out ? (out[1] || out[0]) : null;
  }

  return function (layer, type, prop) {
    const prefix = prefixFromProp(prop);
    const specItem = latest[`${type}_${prefix}`][prop];
    const dflt = specItem.default;

    if (!layer[type]) {
      return  dflt;
    }

    const input = layer[type][prop];

    const objType = typeof(input);
    // Is it an expression...
    if (objType === "undefined") {
      return specItem.default;
    }
    else if (typeof(input) === "object") {
      let expr;
      if (Array.isArray(input)) {
        expr = expression.createExpression(input).value;
      }
      else {
        expr = styleFunction.createFunction(input, specItem);
      }
      if (!expr.evaluate) {
        return null;
      }

      const result = expr.evaluate({zoom}, {});
      if (result) {
        // Because it can be a resolved image.
        return (result.name || result);
      }
      else {
        return null;
      }
    }
    else {
      return input;
    }
  }
}



export function mapImageToDataURL (map, icon) {
  if (!icon) {
    return undefined;
  }

  const image = map.style.imageManager.images[icon];
  if (!image) {
    return undefined;
  }

  const canvasEl = document.createElement("canvas");
  canvasEl.width = image.data.width;
  canvasEl.height = image.data.height;
  const ctx = canvasEl.getContext("2d");
  ctx!.putImageData(
    new ImageData(
      Uint8ClampedArray.from(image.data.data),
      image.data.width, image.data.height
    ),
    0, 0
  );

  // Not toBlob() because toDataURL is faster and synchronous.
  return canvasEl.toDataURL();
}

