import {mapImageToDataURL} from './util';


function renderIconSymbol ({expr, layer, map}) {
  const dataUrl = mapImageToDataURL(
    map,
    expr(layer, "layout", "icon-image"),
  )

  if (dataUrl) {
    // TODO:
    return {
      element: "div",
      attributes: {
        style: {
          backgroundImage: `url(${dataUrl})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          width: "100%",
          height: "100%",
        }
      },
    };
    // return <Image key={icon} {...image.data} />
  }
  else {
    return null;
  }

  // if (layer && layer.layout && layer.layout["icon-image"]) {
  //   let icon = layer.layout["icon-image"];
  //   icon = expr(layer, "layout", "icon-image");

  //   // Slight hack but this API has been stable for a while...
  //   const image = map.style.imageManager.images[icon];

  //   if (image) {
  //     // TODO:
  //     return {element: "div"};
  //     // return <Image key={icon} {...image.data} />
  //   }
  // }
}

function renderTextSymbol ({expr, layer}) {
  const textColor = expr(
    layer, "paint", "text-color"
  );
  const textOpacity = expr(
    layer, "paint", "text-opacity"
  );
  const textHaloColor = expr(
    layer, "paint", "text-halo-color"
  );
  const textHaloWidth = expr(
    layer, "paint", "text-halo-width"
  );

  // A "T" shape to signify text
  const d = "M 4,4 L 16,4 L 16,7 L 11.5 7 L 11.5 16 L 8.5 16 L 8.5 7 L 4 7 Z";

  return {
    element: "svg",
    attributes: {
      viewBox: "0 0 20 20",
      xmlns: "http://www.w3.org/2000/svg"
    },
    children: [
      {
        element: "path",
        attributes: {
          key: "l1",
          d: d,
          stroke: textHaloColor,
          "stroke-width": textHaloWidth*2,
          fill: "transparent",
          "stroke-linejoin": "round",
        }
      },
      {
        element: "path",
        attributes: {
          key: "l2",
          d: d,
          fill: "white",
        }
      },
      {
        element: "path",
        attributes: {
          key: "l3",
          d: d,
          fill: textColor,
          opacity: textOpacity,
        }
      },
    ]
  };
}

export default function Symbol (props) {
  return renderIconSymbol(props) || renderTextSymbol(props);
}
