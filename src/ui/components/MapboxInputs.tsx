import { h, options } from "preact";
import { useRef, useEffect } from "preact/hooks";

import { Dispatch, Store } from "../hooks/useMapbox";
import { Line } from "./Line";
import { Label } from "./Label";

interface Props {
  store: Store;
  dispatch: Dispatch;
}

const MapboxInputs = ({ store, dispatch }: Props) => {
  const input = useRef(null);
  useEffect(() => {
    input.current.focus();
  }, []);
  return (
    <div>
      <div>
        <Label>Address</Label>
        <div style={{ padding: "0 8px" }}>
          <input
            ref={input}
            className="input"
            placeholder="Input Address here:"
            value={store.options.address}
            onInput={(e: any) =>
              dispatch({ type: "INPUT_ADDRESS", value: e.target.value })
            }
          />
        </div>
      </div>
      <Line />
      <div>
        <Label>Style</Label>
        <div style={{ padding: "4px 16px 0" }}>
          <select
            className="select-menu"
            onChange={(e: any) =>
              dispatch({
                type: "INPUT_TYPE",
                value: e.target.value
              })
            }
            value={store.options.type}
          >
            {[
              { label: "Mapbox Streets", value: "streets-v11" },
              { label: "Mapbox Light", value: "light-v10" },
              { label: "Mapbox Dark", value: "dark-v10" },
              { label: "Mapbox Outdoors", value: "outdoors-v11" },
              { label: "Mapbox Satellite", value: "satellite-v9" },
              {
                label: "Mapbox Satellite Streets",
                value: "satellite-streets-v11"
              }
            ].map(s => (
              <option value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <Line />
      <div>
        <Label>Zoom Level</Label>
        <div style={{ padding: "0 8px" }}>
          <input
            type="number"
            className="input"
            placeholder="Zoom Level"
            value={store.options.zoom}
            onInput={(e: any) =>
              dispatch({ type: "INPUT_ZOOM", value: e.target.value })
            }
          />
        </div>
      </div>
      <Line />
      <div>
        <Label>Bearing</Label>
        <div style={{ padding: "0 8px" }}>
          <div
            style={{
              padding: "0 8px",
              marginBottom: 4,
              color: "rgba(0, 0, 0, 0.3)"
            }}
            className="type--12-pos"
          >
            rotates the map around its center
          </div>
          <input
            type="number"
            className="input"
            placeholder="Bearing"
            value={store.options.bearing}
            onInput={(e: any) =>
              dispatch({ type: "INPUT_BEARING", value: e.target.value })
            }
          />
        </div>
      </div>
      <Line />
      <div>
        <Label>Pitch</Label>
        <div style={{ padding: "0 8px" }}>
          <div
            style={{
              padding: "0 8px",
              color: "rgba(0, 0, 0, 0.3)",
              marginBottom: 4
            }}
            className="type--12-pos"
          >
            tilts the map (perspective effect)
          </div>
          <input
            type="number"
            className="input"
            placeholder="Pitch"
            value={store.options.pitch}
            onInput={(e: any) =>
              dispatch({ type: "INPUT_PITCH", value: e.target.value })
            }
          />
        </div>
      </div>
      <Line />
    </div>
  );
};

export { MapboxInputs };
