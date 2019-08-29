import * as React from "react";
import { useEffect, useReducer, Reducer } from "react";
import { render } from "react-dom";
import { Button } from "figma-styled-components";

import { useGoogleMapContext, GoogleMapOptions } from "./hooks/useGoogleMap";
import { useMapboxContext, MapboxOptions } from "./hooks/useMapbox";
import { MapboxInputs } from "./components/MapboxInputs";
import { GoogleMapInputs } from "./components/GoogleMapInputs";
import { Line } from "./components/Line";
import { ChevronsLeft } from "./icons/ChevronsLeft";
import { ChevronsRight } from "./icons/ChevronsRight";

import "figma-plugin-types";
import "./figma-ui.min.css";

type Options = GoogleMapOptions | MapboxOptions;

type Tab = "googleMap" | "mapbox";

interface Store {
  tab: Tab;
  hidePreview: boolean | null;
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
  label,
  active,
  onClick
}: {
  onClick: () => void;
  label: string;
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
    {label}
  </div>
);

const App = () => {
  const [store, dispatch] = useReducer<Reducer<Store, Action>>(
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
      hidePreview: null
    }
  );

  const [googleStore, googleDispatch] = useGoogleMapContext();
  const [mapboxStore, mapboxDispatch] = useMapboxContext();

  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
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

    window.parent.postMessage(
      { pluginMessage: { type: "fetch-initial-data" } },
      "*"
    );
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
              onClick={() => {
                if (store.tab === "mapbox") {
                  googleDispatch({
                    type: "INPUT_ADDRESS",
                    value: mapboxStore.options.address
                  });
                }
                dispatch({ type: "CHANGE_TAB", tab: "googleMap" });
              }}
              active={store.tab === "googleMap"}
              label="Google Maps"
            ></Tab>
            <Tab
              onClick={() => {
                if (store.tab === "googleMap") {
                  mapboxDispatch({
                    type: "INPUT_ADDRESS",
                    value: googleStore.options.address
                  });
                }
                dispatch({ type: "CHANGE_TAB", tab: "mapbox" });
              }}
              active={store.tab === "mapbox"}
              label="Mapbox"
            ></Tab>

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
                {store.hidePreview !== null &&
                  (store.hidePreview ? (
                    <ChevronsRight size={20} />
                  ) : (
                    <ChevronsLeft size={20} />
                  ))}
              </div>
            </div>
          </div>
          <Line />
          {store.tab === "googleMap" ? (
            <GoogleMapInputs />
          ) : store.tab === "mapbox" ? (
            <MapboxInputs />
          ) : null}
        </div>
        <div style={{ padding: "8px 16px 16px" }}>
          <Button
            variant="primary"
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
          </Button>
        </div>
      </div>
      {!store.hidePreview && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <div
            className="type--11-pos-medium"
            style={{
              display: "flex",
              alignItems: "center",
              borderBottom: "1px solid rgba(0,0,0,0.1)",
              height: 43
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
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
};

render(
  <useGoogleMapContext.Provider>
    <useMapboxContext.Provider>
      <App />
    </useMapboxContext.Provider>
  </useGoogleMapContext.Provider>,
  document.getElementById("app")
);
