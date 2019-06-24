document.getElementById("create").onclick = () => {
  const url =
    "https://images.unsplash.com/photo-1560982535-53d62646d312?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2734&q=80";

  const r = fetch(url).then(response =>
    response.arrayBuffer().then(buff => {
      parent.postMessage(
        { pluginMessage: { type: "image", image: new Uint8Array(buff) } },
        "*"
      );
    })
  );
};

document.getElementById("cancel").onclick = () => {
  parent.postMessage({ pluginMessage: { type: "cancel" } }, "*");
};
