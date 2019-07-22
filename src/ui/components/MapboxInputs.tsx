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
        <div style={{ padding: "0 16px" }}>
          <select
            onChange={(e: any) =>
              dispatch({
                type: "INPUT_TYPE",
                value: e.target.value
              })
            }
            value={store.options.type}
          >
            {[
              "streets-v11",
              "outdoors-v11",
              "light-v10",
              "dark-v10",
              "satellite-v9",
              "satellite-streets-v11",
              "navigation-preview-day-v4",
              "navigation-preview-night-v4",
              "navigation-guidance-day-v4",
              "navigation-guidance-night-v4"
            ].map(v => (
              <option>{v}</option>
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
    </div>
  );
};

export { MapboxInputs };
