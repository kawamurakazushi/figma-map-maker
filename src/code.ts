const key = "options";

figma.showUI(__html__, { width: 600, height: 616 });

// Get options of the initial selected node.
const initialSelection = figma.currentPage.selection;
if (initialSelection.length >= 1) {
  figma.ui.postMessage({
    type: "initial",
    data: initialSelection[0].getPluginData(key)
  });
}

figma.ui.onmessage = msg => {
  if (msg.type === "image") {
    const selection = figma.currentPage.selection;

    // Send error if nothing is selected
    if (selection.length === 0) {
      figma.ui.postMessage({ type: "error" });
      return;
    }

    // Fill all selected node
    selection.forEach(node => {
      if (
        node.type === "RECTANGLE" ||
        node.type === "POLYGON" ||
        node.type === "ELLIPSE" ||
        node.type === "VECTOR"
      ) {
        // Save options to node
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
    });
  }

  figma.closePlugin();
};
