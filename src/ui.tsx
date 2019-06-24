// document.getElementById("create").onclick = () => {
//   const url =
//     "https://maps.googleapis.com/maps/api/staticmap?center=Brooklyn+Bridge,New+York,NY&zoom=13&size=600x300&maptype=roadmap&markers=color:blue%7Clabel:S%7C40.702147,-74.015794&markers=color:green%7Clabel:G%7C40.711614,-74.012318&markers=color:red%7Clabel:C%7C40.718217,-73.998284&key=AIzaSyCOHu6yxeJ1XAG6Rji_9j6kIaJVtUbrddk";

//   const r = fetch(url).then(response =>
//     response.arrayBuffer().then(buff => {
//       parent.postMessage(
//         { pluginMessage: { type: "image", image: new Uint8Array(buff) } },
//         "*"
//       );
//     })
//   );
// };

// document.getElementById("cancel").onclick = () => {
//   parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
// };

import { h, render } from "preact";
import { useState } from "preact/hooks";

const App = () => {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>inc {count}</button>;
};

render(<App name="cool working" />, document.getElementById("app"));
