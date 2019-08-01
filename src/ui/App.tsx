import { h, render, ComponentChildren } from "preact";
import { useEffect, useReducer } from "preact/hooks";

import { useGoogleMap, GoogleMapOptions } from "./hooks/useGoogleMap";
import { useMapbox, MapboxOptions } from "./hooks/useMapbox";
import { MapboxInputs } from "./components/MapboxInputs";
import { GoogleMapInputs } from "./components/GoogleMapInputs";
import { Line } from "./components/Line";
import { Hidden } from "./icons/Hidden";
import { Visible } from "./icons/Visible";

import "./figma-ui.min.css";

type Options = GoogleMapOptions | MapboxOptions;

type Tab = "googleMap" | "mapbox";

interface Store {
  tab: Tab;
  hidePreview: boolean;
}

interface ChangeTabAction {
  type: "CHANGE_TAB";
  tab: Tab;
}

interface HidePreviewAction {
  type: "HIDE_PREVIEW";
}

interface ShowPreviewAction {
  type: "SHOW_PREVIEW";
}

type Action = ChangeTabAction | HidePreviewAction | ShowPreviewAction;

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
    className="type--11-pos-medium"
  >
    {children}
  </div>
);

const App = () => {
  const [store, dispatch] = useReducer<Store, Action>(
    (state, action) => {
      switch (action.type) {
        case "CHANGE_TAB":
          return { ...state, tab: action.tab };

        case "HIDE_PREVIEW":
          return { ...state, hidePreview: true };

        case "SHOW_PREVIEW":
          return { ...state, hidePreview: false };

        default:
          return state;
      }
    },
    {
      tab: "googleMap",
      hidePreview: false
    }
  );

  const [googleStore, googleDispatch] = useGoogleMap();
  const [mapboxStore, mapboxDispatch] = useMapbox();

  useEffect(() => {
    onmessage = event => {
      const msg = event.data.pluginMessage;

      if (msg.type === "set-preview") {
        if (msg.preview) {
          dispatch({ type: "SHOW_PREVIEW" });
        } else {
          dispatch({ type: "HIDE_PREVIEW" });
        }
      }

      if (msg.type === "set-options") {
        if (!msg.options) {
          return;
        }

        const options = JSON.parse(msg.options);

        if (options.mapbox) {
          mapboxDispatch({ type: "INPUT_OPTIONS", value: options.mapbox });
          dispatch({ type: "CHANGE_TAB", tab: "mapbox" });
        }

        if (options.googleMap) {
          googleDispatch({ type: "INPUT_OPTIONS", value: options.googleMap });
          dispatch({ type: "CHANGE_TAB", tab: "googleMap" });
        }
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
      <div style={{ width: 300, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>
          <div
            style={{
              display: "flex",
              padding: "0 16px",
              marginTop: 12,
              alignItems: "center"
            }}
          >
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

            <div
              style={{ display: "flex", flex: 1, flexDirection: "row-reverse" }}
            >
              <div
                // style={{ padding: 0, width: 20, height: 20 }}
                onClick={() => {
                  if (store.hidePreview) {
                    parent.postMessage(
                      {
                        pluginMessage: {
                          type: "show-preview"
                        }
                      },
                      "*"
                    );
                    dispatch({ type: "SHOW_PREVIEW" });
                  }

                  if (!store.hidePreview) {
                    parent.postMessage(
                      {
                        pluginMessage: {
                          type: "hide-preview"
                        }
                      },
                      "*"
                    );
                    dispatch({ type: "HIDE_PREVIEW" });
                  }
                }}
              >
                {store.hidePreview ? (
                  <Hidden size={20} />
                ) : (
                  <Visible size={20} />
                )}
              </div>
            </div>
          </div>
          <Line />
          {store.tab === "googleMap" ? (
            <GoogleMapInputs store={googleStore} dispatch={googleDispatch} />
          ) : store.tab === "mapbox" ? (
            <MapboxInputs store={mapboxStore} dispatch={mapboxDispatch} />
          ) : null}
        </div>
        <div style={{ padding: "8px 16px" }}>
          <button
            className="button button--primary"
            style={{ width: "100%" }}
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
      {!store.hidePreview && (
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column"
          }}
        >
          <div
            className="type--11-pos-medium"
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              borderBottom: "1px solid rgba(0,0,0,0.1)"
            }}
          >
            Preview
          </div>

          <img
            style={{ width: "100%", height: 500 }}
            src={
              store.tab === "googleMap"
                ? googleStore.url
                : store.tab === "mapbox"
                ? mapboxStore.url
                : null
            }
          />
        </div>
      )}
    </div>
  );
};

render(<App />, document.getElementById("app"));
