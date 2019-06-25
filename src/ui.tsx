import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";

interface MapOptions {
  address: string;
  type: string;
  marker: boolean;
  zoom: number;
}

const generateUrl = ({ address, type, marker, zoom }: MapOptions) => {
  const encodedAddress = encodeURIComponent(address);
  const url =
    `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=${zoom}&size=600x300&maptype=${type}&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk` +
    (marker ? `&markers=color:red|${encodedAddress}` : "");

  return url;
};

const send = (options: MapOptions) => {
  const url = generateUrl(options);
  fetch(url).then(response =>
    response.arrayBuffer().then(buff => {
      parent.postMessage(
        {
          pluginMessage: { type: "image", image: new Uint8Array(buff), options }
        },
        "*"
      );
    })
  );
};

const smallText = {
  fontSize: 12
};

const App = () => {
  const [address, setAddress] = useState("");
  const [type, setType] = useState("roadmap");
  const [marker, setMarker] = useState(false);
  const [zoom, setZoom] = useState(15);

  const handleAddress = e => {
    setAddress(e.target.value);
  };

  const handleType = e => {
    setType(e.target.value);
  };

  const handleMarker = e => {
    setMarker(e.target.checked);
  };

  useEffect(() => {
    onmessage = event => {
      const o: MapOptions = JSON.parse(event.data.pluginMessage);
      setAddress(o.address);
      setType(o.type);
      setMarker(o.marker);
      setZoom(o.zoom);
    };
  }, []);

  const options = { address, type, marker, zoom };

  return (
    <div style={{ padding: "0 8px" }}>
      <div>
        <p style={smallText}>Address:</p>
        <input style={{ width: 400 }} value={address} onInput={handleAddress} />
      </div>
      <div>
        <p style={smallText}>Map Type:</p>
        <select onChange={handleType} value={type}>
          {["roadmap", "satellite", "hybrid", "terrain"].map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <p style={smallText}>Zoom Level:</p>
        <button disabled={zoom <= 0} onClick={() => setZoom(zoom - 1)}>
          -
        </button>
        <span style={{ ...smallText, margin: "0 8px" }}>{zoom}</span>
        <button disabled={zoom >= 20} onClick={() => setZoom(zoom + 1)}>
          +
        </button>
      </div>
      <div style={{ margin: "16px 0" }}>
        <label style={smallText}>
          <input
            style={{ marginRight: 8 }}
            onChange={handleMarker}
            checked={marker}
            type="checkbox"
          />
          Show Marker
        </label>
      </div>
      <button style={{ marginBottom: 16 }} onClick={() => send(options)}>
        Make it
      </button>
      <img style={{ width: "100%" }} src={generateUrl(options)} />
    </div>
  );
};

render(<App />, document.getElementById("app"));
