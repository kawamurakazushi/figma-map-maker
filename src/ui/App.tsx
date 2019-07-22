import { h, render, ComponentChildren } from "preact";
import { useEffect, useReducer } from "preact/hooks";

import { useGoogleMap, GoogleMapOptions } from "./hooks/useGoogleMap";
import { GoogleMapInputs } from "./components/GoogleMapInputs";
import { Line } from "./components/Line";

import "./figma-ui.min.css";

type Options = GoogleMapOptions;

interface Store {
  error: boolean;
}

interface ErrorAction {
  type: "ERROR";
}

type Action = ErrorAction;

const send = async (url: string, options: Options) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  parent.postMessage(
    {
      pluginMessage: { type: "image", image: new Uint8Array(buffer), options }
    },
    "*"
  );
};

const Tab = ({
  children,
  active
}: {
  children: ComponentChildren;
  active: boolean;
}) => (
  <div
    style={{
      marginRight: 16,
      color: active ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.3)",
      cursor: "default"
    }}
    className="type--12-pos-medium"
  >
    {children}
  </div>
);

const App = () => {
  const [store, dispatch] = useReducer<Store, Action>(
    (state, action) => {
      switch (action.type) {
        case "ERROR":
          return { ...state, error: true };

        default:
          return state;
      }
    },
    {
      error: false
    }
  );

  const [googleStore, googleDispatch] = useGoogleMap();

  useEffect(() => {
    onmessage = event => {
      const msg = event.data.pluginMessage;

      if (msg.type === "initial") {
        const nodeOption: Options = JSON.parse(msg.data);
        googleDispatch({ type: "INPUT_OPTIONS", value: nodeOption });
      }

      if (msg.type === "error") {
        dispatch({ type: "ERROR" });
      }
    };
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "row"
      }}
    >
      <div style={{}}>
        <div style={{ display: "flex", padding: "0 16px", marginTop: 16 }}>
          <Tab active={true}>Google Maps</Tab>
          <Tab active={false}>Mapbox</Tab>
        </div>
        <Line />
        <GoogleMapInputs store={googleStore} dispatch={googleDispatch} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column"
        }}
      >
        <img style={{ width: "100%" }} src={googleStore.url} />
        {store.error && (
          <p
            className="type--12-pos"
            style={{ color: "#f24822", marginLeft: 8 }}
          >
            Please select at least one layer.
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <button
            className="button button--primary"
            style={{ width: "100px" }}
            onClick={() => send(googleStore.url, googleStore.options)}
          >
            Make Map
          </button>
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
