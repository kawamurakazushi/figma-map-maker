const key = "options";

figma.showUI(__html__, { width: 800, height: 565 });

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

    const fillMap = (
      node: RectangleNode | PolygonNode | EllipseNode | VectorNode
    ) => {
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

      return node;
    };

    // Fill all selected fillable node
    selection.forEach(node => {
      if (
        node.type === "RECTANGLE" ||
        node.type === "POLYGON" ||
        node.type === "ELLIPSE" ||
        node.type === "VECTOR"
      ) {
        fillMap(node);
      }
    });

    // Create a Rectangle id there is no selected node. or one node which is a frame
    if (selection.length === 0) {
      const node = fillMap(figma.createRectangle());
      const { x, y } = figma.viewport.center;
      node.x = x;
      node.y = y;
      figma.currentPage.selection = [node];
      figma.currentPage.appendChild(node);
    }

    // Create Map if 1 frame is selected
    if (selection.length === 1 && selection[0].type === "FRAME") {
      const frame = selection[0];
      if (frame.type === "FRAME") {
        const node = fillMap(figma.createRectangle());
        figma.currentPage.selection = [node];
        frame.appendChild(node);
      }
    }
  }

  figma.closePlugin();
};
