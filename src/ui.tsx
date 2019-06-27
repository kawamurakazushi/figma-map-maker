import { h, render } from "preact";
import { useEffect, useReducer } from "preact/hooks";

interface MapOptions {
  address: string;
  type: "roadmap" | "satellite" | "hybrid" | "terrain";
  marker: boolean;
  zoom: number;
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
  | InputOptionsAction;

const generateUrl = ({ address, type, marker, zoom }: MapOptions) => {
  const encodedAddress = encodeURIComponent(address);
  const url =
    `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=${zoom}&size=600x300&maptype=${type}&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk` +
    (marker ? `&markers=color:red|${encodedAddress}` : "");

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

const smallText = {
  fontSize: 12
};

const tab = (active: boolean) => ({
  ...smallText,
  cursor: "pointer",
  fontWeight: active ? "bold" : undefined,
  color: active ? undefined : "lightgrey"
});

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
          console.log(action.value);
          return {
            ...state,
            options: { ...state.options, marker: action.value }
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
        padding: "0 8px",
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div style={{ display: "flex", padding: "2px 0" }}>
        <span
          onClick={() => dispatch({ type: "CHANGE_TAB", tab: 0 })}
          style={{ ...tab(store.tab === 0), ...{ marginRight: 12 } }}
        >
          Basic
        </span>
        <span
          onClick={() => dispatch({ type: "CHANGE_TAB", tab: 1 })}
          style={{ ...tab(store.tab === 1) }}
        >
          Advance
        </span>
      </div>
      <div
        style={{
          height: "1px",
          width: "100%",
          backgroundColor: "lightgrey",
          margin: "8px 0"
        }}
      />
      {store.tab === 0 && (
        <div>
          <div>
            <p style={smallText}>Address:</p>
            <input
              style={{ width: 400 }}
              value={store.options.address}
              onInput={(e: any) =>
                dispatch({ type: "INPUT_ADDRESS", value: e.target.value })
              }
            />
          </div>
          <div>
            <p style={smallText}>Map Type:</p>
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
            <p style={smallText}>Zoom Level:</p>
            <button
              disabled={store.options.zoom <= 0}
              onClick={() =>
                dispatch({ type: "INPUT_ZOOM", value: store.options.zoom - 1 })
              }
            >
              -
            </button>
            <span style={{ ...smallText, margin: "0 8px" }}>
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
            <label style={smallText}>
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
          <textarea style={{ width: "100%" }} rows={5} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <button
          style={{ marginBottom: 16 }}
          onClick={() => send(store.options)}
        >
          Make it
        </button>
        <img style={{ width: "100%" }} src={generateUrl(store.options)} />
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
