import { useReducer } from "preact/hooks";

import { convert } from "../googleStyleConverter";

interface GoogleMapOptions {
  address: string;
  type: "roadmap" | "satellite" | "hybrid" | "terrain";
  marker: boolean;
  zoom: number;
  json?: string;
}

interface InternalStore {
  options: GoogleMapOptions;
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
  value: GoogleMapOptions;
}

type Action =
  | InputAddressAction
  | InputZoomAction
  | InputMarkerAction
  | InputMapTypeAction
  | InputJsonAction
  | InputOptionsAction;

const generateUrl = ({
  address,
  type,
  marker,
  zoom,
  json
}: GoogleMapOptions) => {
  const encodedAddress = encodeURIComponent(address);

  const style = convert(json);

  const url =
    `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=${zoom}&size=600x600&maptype=${type}&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk` +
    (marker ? `&markers=color:red|${encodedAddress}` : "") +
    (style ? style : "");

  return url;
};

interface Store extends InternalStore {
  url: string;
  jsonIsInvalid: boolean;
}

type Dispatch = (action: Action) => void;

const useGoogleMap = (): [Store, Dispatch] => {
  const [store, dispatch] = useReducer<InternalStore, Action>(
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
            options: action.value
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
        zoom: 15
      }
    }
  );

  return [
    {
      url: generateUrl(store.options),
      jsonIsInvalid:
        store.options.json && convert(store.options.json) === undefined,
      ...store
    },
    dispatch
  ];
};

export { useGoogleMap, GoogleMapOptions, Store, Dispatch };
