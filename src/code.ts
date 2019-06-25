const key = "options";

figma.showUI(__html__, { width: 600, height: 550 });

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
        node.type === "ELLIPSE"
      ) {
        const newImage = figma.createImage(msg.image);

        // Save options
        if (msg.options) {
          node.setPluginData(key, JSON.stringify(msg.options));
        }

        node.fills = [
          {
            type: "IMAGE",
            image: newImage,
            scaleMode: "FILL"
          }
        ];
      }
    }
  }

  figma.closePlugin();
};
