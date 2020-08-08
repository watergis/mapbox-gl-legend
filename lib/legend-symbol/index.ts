import Circle from "./Circle";
import Fill from "./Fill";
import Line from "./Line";
import Symbol from "./Symbol";
import {exprHandler} from './util';


export default function ({map, layer}) {
  const TYPE_MAP = {
    "circle": Circle,
    "symbol": Symbol,
    "line": Line,
    "fill": Fill,
  };

  const handler = TYPE_MAP[layer.type];
  const expr = exprHandler(map);

  if (handler) {
    return handler({map, layer, expr});
  }
  else {
    return null;
  }
}
