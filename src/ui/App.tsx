import { h, render, ComponentChildren } from "preact";
import { useEffect, useReducer } from "preact/hooks";

import { useGoogleMap, GoogleMapOptions } from "./hooks/useGoogleMap";
import { useMapbox, MapboxOptions } from "./hooks/useMapbox";
import { MapboxInputs } from "./components/MapboxInputs";
import { GoogleMapInputs } from "./components/GoogleMapInputs";
import { Line } from "./components/Line";

import "./figma-ui.min.css";

type Options = GoogleMapOptions | MapboxOptions;

type Tab = "googleMap" | "mapbox";

interface Store {
  error: boolean;
  tab: Tab;
}

interface ErrorAction {
  type: "ERROR";
}

interface ChangeTabAction {
  type: "CHANGE_TAB";
  tab: Tab;
}

type Action = ErrorAction | ChangeTabAction;

const send = async (host: Tab, url: string, options: Options) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  parent.postMessage(
    {
      pluginMessage: {
        type: "image",
        image: new Uint8Array(buffer),
        options: {
          [host]: options
        }
      }
    },
    "*"
  );
};

const Tab = ({
  children,
  active,
  onClick
}: {
  onClick: () => void;
  children: ComponentChildren;
  active: boolean;
}) => (
  <div
    style={{
      marginRight: 16,
      color: active ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.3)",
      cursor: "default"
    }}
    onClick={onClick}
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

        case "CHANGE_TAB":
          return { ...state, tab: action.tab };

        default:
          return state;
      }
    },
    {
      error: false,
      tab: "googleMap"
    }
  );

  const [googleStore, googleDispatch] = useGoogleMap();
  const [mapboxStore, mapboxDispatch] = useMapbox();

  useEffect(() => {
    onmessage = event => {
      const msg = event.data.pluginMessage;

      if (msg.type === "initial") {
        const options = JSON.parse(msg.data);

        if (options.mapbox) {
          mapboxDispatch({ type: "INPUT_OPTIONS", value: options.mapbox });
          dispatch({ type: "CHANGE_TAB", tab: "mapbox" });
        }

        if (options.googleMap) {
          googleDispatch({ type: "INPUT_OPTIONS", value: options.googleMap });
          dispatch({ type: "CHANGE_TAB", tab: "googleMap" });
        }
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
      <div style={{ width: 300 }}>
        <div style={{ display: "flex", padding: "0 16px", marginTop: 16 }}>
          <Tab
            onClick={() => dispatch({ type: "CHANGE_TAB", tab: "googleMap" })}
            active={store.tab === "googleMap"}
          >
            Google Maps
          </Tab>
          <Tab
            onClick={() => dispatch({ type: "CHANGE_TAB", tab: "mapbox" })}
            active={store.tab === "mapbox"}
          >
            Mapbox
          </Tab>
        </div>
        <Line />
        {store.tab === "googleMap" ? (
          <GoogleMapInputs store={googleStore} dispatch={googleDispatch} />
        ) : store.tab === "mapbox" ? (
          <MapboxInputs store={mapboxStore} dispatch={mapboxDispatch} />
        ) : null}
      </div>
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "column"
        }}
      >
        <img
          style={{ width: "100%" }}
          src={store.tab === "googleMap" ? googleStore.url : mapboxStore.url}
        />
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
            onClick={() => {
              if (store.tab === "googleMap") {
                send("googleMap", googleStore.url, googleStore.options);
              }

              if (store.tab === "mapbox") {
                send("mapbox", mapboxStore.url, mapboxStore.options);
              }
            }}
          >
            Make Map
          </button>
        </div>
      </div>
    </div>
  );
};

render(<App />, document.getElementById("app"));
