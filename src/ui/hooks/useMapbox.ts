import { useReducer, useEffect } from "preact/hooks";

type MapType =
  | "streets-v11"
  | "outdoors-v11"
  | "light-v10"
  | "dark-v10"
  | "satellite-v9"
  | "satellite-streets-v11"
  | "navigation-preview-day-v4"
  | "navigation-preview-night-v4"
  | "navigation-guidance-day-v4"
  | "navigation-guidance-night-v4";

interface MapboxOptions {
  address: string;
  type: MapType;
  zoom: number;
}

interface InternalStore {
  options: MapboxOptions;
  url: string;
}

interface InputAddressAction {
  type: "INPUT_ADDRESS";
  value: string;
}

interface InputZoomAction {
  type: "INPUT_ZOOM";
  value: number;
}

interface InputTypeAction {
  type: "INPUT_TYPE";
  value: MapType;
}

interface InputOptionsAction {
  type: "INPUT_OPTIONS";
  value: MapboxOptions;
}

interface SetUrlAction {
  type: "SET_URL";
  url: string;
}

type Action =
  | InputAddressAction
  | SetUrlAction
  | InputZoomAction
  | InputTypeAction
  | InputOptionsAction;

const generateUrl = async ({ address, zoom, type }: MapboxOptions) => {
  const token =
    "pk.eyJ1Ijoia2F3YW11cmFrYXp1c2hpIiwiYSI6ImNqeWF1ejRzcjAyaWgzbnAxbG43cWZoZHIifQ.8-5NAOmlWk3iQnrIJSPmbw";

  const encodedAddress = encodeURIComponent(address);

  // if there is no address return a default image.
  if (encodedAddress === "") {
    return "https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/139.7263785,35.6652065,12,0,0/600x600?access_token=pk.eyJ1Ijoia2F3YW11cmFrYXp1c2hpIiwiYSI6ImNqeWF1ejRzcjAyaWgzbnAxbG43cWZoZHIifQ.8-5NAOmlWk3iQnrIJSPmbw";
  }

  const placeUrl =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    encodedAddress +
    `.json?access_token=${token}&limit=1`;

  // TODO: More type Safetly
  const place = await (await fetch(placeUrl)).json();

  if (
    place.features &&
    place.features.length >= 1 &&
    place.features[0].center.length !== 2
  ) {
    return "";
  }

  const center = place.features[0].center;
  const url = `https://api.mapbox.com/styles/v1/mapbox/${type}/static/${center.join(
    ","
  )},${zoom},0,0/600x600?access_token=${token}`;

  return url;
};

interface Store extends InternalStore {}

type Dispatch = (action: Action) => void;

const useMapbox = (): [Store, Dispatch] => {
  const [store, dispatch] = useReducer<InternalStore, Action>(
    (state, action) => {
      switch (action.type) {
        case "INPUT_ADDRESS":
          return {
            ...state,
            options: { ...state.options, address: action.value }
          };

        case "INPUT_TYPE":
          return {
            ...state,
            options: { ...state.options, type: action.value }
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
        zoom: 10,
        type: "streets-v11"
      },
      url: ""
    }
  );

  useEffect(() => {
    const f = async () => {
      const url = await generateUrl(store.options);
      dispatch({ type: "SET_URL", url });
    };

    f();
  }, [store.options]);

  return [
    {
      url: store.url,
      ...store
    },
    dispatch
  ];
};

export { useMapbox, MapboxOptions, Store, Dispatch };
