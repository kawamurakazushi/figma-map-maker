import { h, render } from "preact";
import { useEffect, useReducer } from "preact/hooks";
import { convert } from "./styleConverter";

import "./figma-ui.min.css";
// import "./figma-ui.min.js";

interface MapOptions {
  address: string;
  type: "roadmap" | "satellite" | "hybrid" | "terrain";
  marker: boolean;
  zoom: number;
  json?: string;
}

interface Store {
  tab: number;
  options: MapOptions;
}

interface ChangeTabAction {
  type: "CHANGE_TAB";
  tab: number;
}

interface InputZoomAction {
  type: "INPUT_ZOOM";
  value: number;
}

interface InputMapTypeAction {
  type: "INPUT_MAP_TYPE";
  value: "roadmap" | "satellite" | "hybrid" | "terrain";
}

interface InputAddressAction {
  type: "INPUT_ADDRESS";
  value: string;
}

interface InputMarkerAction {
  type: "INPUT_MARKER";
  value: boolean;
}

interface InputJsonAction {
  type: "INPUT_JSON";
  value: string;
}

interface InputOptionsAction {
  type: "INPUT_OPTIONS";
  value: MapOptions;
}

type Action =
  | ChangeTabAction
  | InputAddressAction
  | InputZoomAction
  | InputMarkerAction
  | InputMapTypeAction
  | InputJsonAction
  | InputOptionsAction;

const generateUrl = ({ address, type, marker, zoom, json }: MapOptions) => {
  const encodedAddress = encodeURIComponent(address);
  const url =
    `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=${zoom}&size=600x300&maptype=${type}&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk` +
    (marker ? `&markers=color:red|${encodedAddress}` : "") +
    (json ? convert(json) : "");

  return url;
};

const send = async (options: MapOptions) => {
  const url = generateUrl(options);
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  parent.postMessage(
    {
      pluginMessage: { type: "image", image: new Uint8Array(buffer), options }
    },
    "*"
  );
};

const App = () => {
  const [store, dispatch] = useReducer<Store, Action>(
    (state, action) => {
      switch (action.type) {
        case "CHANGE_TAB":
          return { ...state, tab: action.tab };

        case "INPUT_ADDRESS":
          return {
            ...state,
            options: { ...state.options, address: action.value }
          };

        case "INPUT_MAP_TYPE":
          return {
            ...state,
            options: { ...state.options, type: action.value }
          };

        case "INPUT_MARKER":
          return {
            ...state,
            options: { ...state.options, marker: action.value }
          };

        case "INPUT_JSON":
          return {
            ...state,
            options: { ...state.options, json: action.value }
          };

        case "INPUT_ZOOM":
          return {
            ...state,
            options: { ...state.options, zoom: action.value }
          };

        case "INPUT_OPTIONS":
          return {
            ...state,
            options: action.value
          };

        default:
          return state;
      }
    },
    {
      tab: 0,
      options: {
        address: "",
        type: "roadmap",
        marker: false,
        zoom: 15
      }
    }
  );

  useEffect(() => {
    onmessage = event => {
      const data = event.data.pluginMessage;
      if (data) {
        const nodeOption: MapOptions = JSON.parse(data);
        dispatch({ type: "INPUT_OPTIONS", value: nodeOption });
      }
    };
  }, []);

  return (
    <div
      style={{
        padding: "8px",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ display: "flex", padding: "2px 0" }}>
        <span
          className={store.tab === 0 ? "type--12-pos-bold" : "type--12-pos"}
          onClick={() => dispatch({ type: "CHANGE_TAB", tab: 0 })}
          style={{
            marginRight: 8,
            cursor: "pointer",
            ...(store.tab === 0 ? {} : { color: "rgba(0, 0, 0, 0.3)" })
          }}
        >
          Basic
        </span>
        <span
          className={store.tab === 1 ? "type--12-pos-bold" : "type--12-pos"}
          onClick={() => dispatch({ type: "CHANGE_TAB", tab: 1 })}
          style={{
            cursor: "pointer",
            ...(store.tab === 1 ? {} : { color: "rgba(0, 0, 0, 0.3)" })
          }}
        >
          Advance
        </span>
      </div>
      {store.tab === 0 && (
        <div>
          <div style={{}}>
            <p className="type--12-pos">Address:</p>
            <input
              className="input"
              placeholder="Input Address here:"
              value={store.options.address}
              onInput={(e: any) =>
                dispatch({ type: "INPUT_ADDRESS", value: e.target.value })
              }
            />
          </div>
          <div>
            <p className="type--12-pos">Map Type:</p>
            <select
              onChange={(e: any) =>
                dispatch({ type: "INPUT_MAP_TYPE", value: e.target.value })
              }
              value={store.options.type}
            >
              {["roadmap", "satellite", "hybrid", "terrain"].map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <p className="type--12-pos">Zoom Level:</p>
            <button
              disabled={store.options.zoom <= 0}
              onClick={() =>
                dispatch({ type: "INPUT_ZOOM", value: store.options.zoom - 1 })
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
                dispatch({ type: "INPUT_ZOOM", value: store.options.zoom + 1 })
              }
            >
              +
            </button>
          </div>
          <div style={{ margin: "16px 0" }}>
            <label className="type--12-pos">
              <input
                style={{ marginRight: 8 }}
                onChange={(e: any) =>
                  dispatch({ type: "INPUT_MARKER", value: e.target.checked })
                }
                checked={store.options.marker}
                type="checkbox"
              />
              Show Marker
            </label>
          </div>
        </div>
      )}
      {store.tab === 1 && (
        <div>
          <p className="type--12-pos">Paste your JSON</p>
          <textarea
            className="textarea"
            onInput={(e: any) =>
              dispatch({ type: "INPUT_JSON", value: e.target.value })
            }
            style={{ width: "100%" }}
            rows={5}
          >
            {store.options.json}
          </textarea>
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
      )}
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column-reverse" }}
      >
        <img style={{ width: "100%" }} src={generateUrl(store.options)} />
        <button
          className="button button--primary"
          style={{ marginBottom: 16, width: "80px" }}
          onClick={() => send(store.options)}
        >
          Make it
        </button>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
