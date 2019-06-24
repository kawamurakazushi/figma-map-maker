import { h, render } from "preact";
import { useState } from "preact/hooks";

interface MapOptions {
  address: string;
  type: string;
  marker: boolean;
}

const send = ({ address, type, marker }: MapOptions) => {
  const encodedAddress = encodeURIComponent(address);
  const url =
    `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=13&size=600x300&maptype=${type}&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk` +
    (marker ? `&markers=color:red|${encodedAddress}` : "");

  console.log(url);

  fetch(url).then(response =>
    response.arrayBuffer().then(buff => {
      parent.postMessage(
        { pluginMessage: { type: "image", image: new Uint8Array(buff) } },
        "*"
      );
    })
  );
};

const App = () => {
  const [address, setAddress] = useState("");
  const [type, setType] = useState("roadmap");
  const [marker, setMarker] = useState(false);

  const handleAddress = e => {
    setAddress(e.target.value);
  };

  const handleType = e => {
    setType(e.target.value);
  };

  const handleMarker = e => {
    console.log(e.target.checked);
    setMarker(e.target.checked);
  };

  return (
    <div>
      <div>
        <input value={address} onInput={handleAddress} />
      </div>
      <div>
        <select onChange={handleType} value={type}>
          {["roadmap", "satellite", "hybrid", "terrain"].map(t => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div>
        <input onChange={handleMarker} type="checkbox">
          Display Marker
        </input>
      </div>
      <button onClick={() => send({ address, type, marker })}>Send</button>
    </div>
  );
};

render(<App />, document.getElementById("app"));
