import * as React from "react";
import { useRef, useEffect } from "react";

import { Select } from "../figma";
import { Dispatch, Store } from "../hooks/useGoogleMap";
import { Line } from "./Line";
import { Label } from "./Label";

interface Props {
  store: Store;
  dispatch: Dispatch;
}

const GoogleMapInputs = ({ store, dispatch }: Props) => {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  return (
    <div>
      <div>
        <Label label="Address"></Label>
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
        <Label label="Map Type"></Label>
        <div style={{ padding: "4px 16px 0" }}>
          <Select
            onChange={({ value }) => {
              if (
                "roadmap" === value ||
                "satellite" === value ||
                "hybrid" === value ||
                "terrain" === value
              ) {
                dispatch({
                  type: "INPUT_MAP_TYPE",
                  value
                });
              }
            }}
            value={store.options.type}
            options={[
              { label: "Roadmap", value: "roadmap" },
              { label: "Satellite", value: "satellite" },
              { label: "Hybrid", value: "hybrid" },
              { label: "Terrain", value: "terrain" }
            ]}
          ></Select>
        </div>
      </div>
      <Line />
      <div>
        <Label label="Zoom Level"></Label>
        <div style={{ padding: "4px 16px 0" }}>
          <button
            disabled={store.options.zoom <= 0}
            onClick={() =>
              dispatch({
                type: "INPUT_ZOOM",
                value: store.options.zoom - 1
              })
            }
          >
            -
          </button>
          <span className="type--12-pos" style={{ margin: "0 8px" }}>
            {store.options.zoom}
          </span>
          <button
            disabled={store.options.zoom >= 20}
            onClick={() =>
              dispatch({
                type: "INPUT_ZOOM",
                value: store.options.zoom + 1
              })
            }
          >
            +
          </button>
        </div>
      </div>
      <div style={{ margin: "16px" }}>
        <label className="type--12-pos">
          <input
            style={{ marginRight: 8 }}
            onChange={(e: any) =>
              dispatch({
                type: "INPUT_MARKER",
                value: e.target.checked
              })
            }
            checked={store.options.marker}
            type="checkbox"
          />
          Show Marker
        </label>
      </div>
      <Line />
      <div>
        <Label label="Custom Style"></Label>
        <div style={{ padding: "4px 16px 0" }}>
          <textarea
            className="textarea"
            onInput={(e: any) =>
              dispatch({ type: "INPUT_JSON", value: e.target.value })
            }
            style={{ width: "100%", margin: 0 }}
            rows={5}
            placeholder="Paste Your JSON here."
          >
            {store.options.json}
          </textarea>
          {store.jsonIsInvalid && (
            <p className="type--12-pos" style={{ color: "#f24822" }}>
              Invalid JSON. Please check your format.
            </p>
          )}
          <p className="type--12-pos">
            Find at more here:{" "}
            <a target="__blank" href="https://snazzymaps.com/explore">
              Snazzy Map
            </a>{" "}
            <a target="__blank" href="https://mapstyle.withgoogle.com/">
              Google Official Map Style
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export { GoogleMapInputs };
