const key = "options";

figma.showUI(__html__, { width: 600, height: 616 });

const selection = figma.currentPage.selection;
if (selection.length === 1) {
  const node = selection[0];
  // send options to UI.
  figma.ui.postMessage(node.getPluginData(key));
}

figma.ui.onmessage = msg => {
  if (msg.type === "image") {
    if (selection.length === 1) {
      const node = selection[0];
      // TODO: Error Handling
      if (
        node.type === "RECTANGLE" ||
        node.type === "POLYGON" ||
        node.type === "ELLIPSE" ||
        node.type === "VECTOR"
      ) {
        // Save options
        if (msg.options) {
          node.setPluginData(key, JSON.stringify(msg.options));
        }

        const image = figma.createImage(msg.image);

        node.fills = [
          {
            type: "IMAGE",
            imageHash: image.hash,
            scaleMode: "FILL"
          }
        ];
      }
    }
  }

  figma.closePlugin();
};
