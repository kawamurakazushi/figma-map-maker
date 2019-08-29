import createUseContext from "constate";
import { useReducer, useEffect, Reducer } from "react";
import { useDebounce } from "use-debounce";

import { convert } from "../googleStyleConverter";

interface GoogleMapOptions {
  address: string;
  type: "roadmap" | "satellite" | "hybrid" | "terrain";
  marker: boolean;
  zoom: number | "";
  json: string;
}

interface InternalStore {
  options: GoogleMapOptions;
  url: string;
}

interface InputZoomAction {
  type: "INPUT_ZOOM";
  value: number | "";
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
  value: GoogleMapOptions;
}

interface SetUrlAction {
  type: "SET_URL";
  url: string;
}

type Action =
  | InputAddressAction
  | InputZoomAction
  | InputMarkerAction
  | InputMapTypeAction
  | InputJsonAction
  | InputOptionsAction
  | SetUrlAction;

const generateUrl = ({
  address,
  type,
  marker,
  zoom,
  json
}: GoogleMapOptions) => {
  const encodedAddress = encodeURIComponent(address);

  // if there is no address return a default image.
  if (encodedAddress === "") {
    return "https://maps.googleapis.com/maps/api/staticmap?scale=2&center=San%20Francisco%20US&zoom=15&size=600x600&maptype=roadmap&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk";
  }

  const url =
    `https://maps.googleapis.com/maps/api/staticmap?scale=2&center=${encodedAddress}&zoom=${zoom}&size=600x600&maptype=${type}&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk` +
    (marker ? `&markers=color:red|${encodedAddress}` : "") +
    (json ? convert(json) : "");

  return url;
};

interface Store extends InternalStore {
  url: string;
  jsonIsInvalid: boolean;
}

type Dispatch = (action: Action) => void;

const useGoogleMap = (): [Store, Dispatch] => {
  const [store, dispatch] = useReducer<Reducer<InternalStore, Action>>(
    (state, action) => {
      switch (action.type) {
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
            options: { ...action.value }
          };

        case "SET_URL":
          return {
            ...state,
            url: action.url
          };

        default:
          return state;
      }
    },
    {
      options: {
        address: "",
        type: "roadmap",
        marker: false,
        zoom: 15,
        json: ""
      },
      url:
        "https://maps.googleapis.com/maps/api/staticmap?scale=2&center=San%20Francisco%20US&zoom=15&size=600x600&maptype=roadmap&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk"
    }
  );

  const url = generateUrl(store.options);
  const [debounceAddress] = useDebounce(store.options.address, 500);

  useEffect(() => {
    const f = async () => {
      if (store.options.address !== "") {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        parent.postMessage(
          {
            pluginMessage: {
              type: "preview",
              image: new Uint8Array(buffer),
              options: {
                googleMap: store.options
              }
            }
          },
          "*"
        );
        dispatch({ type: "SET_URL", url });
      }
    };

    f();
  }, [
    store.options.json,
    store.options.marker,
    store.options.marker,
    store.options.type,
    store.options.zoom,
    debounceAddress
  ]);

  return [
    {
      jsonIsInvalid:
        store.options.json !== "" && convert(store.options.json) === "",
      ...store
    },
    dispatch
  ];
};

const useGoogleMapContext = createUseContext(useGoogleMap);

export { useGoogleMapContext, GoogleMapOptions, Store, Dispatch };
