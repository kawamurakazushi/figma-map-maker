figma.showUI(__html__);
figma.ui.onmessage = msg => {
  if (msg.type === "image") {
    const selection = figma.currentPage.selection;
    // TODO: more types
    if (selection.length === 1) {
      const node = selection[0];

      console.log(node.type);

      // TODO: id the type is PageNode
      if (
        node.type === "RECTANGLE" ||
        node.type === "POLYGON" ||
        node.type === "ELLIPSE"
      ) {
        const newImage = figma.createImage(msg.image);
        node.fills = [
          {
            type: "IMAGE",
            image: newImage,
            scaleMode: "FILL"
          }
        ];
      }
      // const rect = figma.createRectangle();
      // rect.resize(600, 300);
    }
  }
  if (msg.type === "create-rectangles") {
    const nodes = [];
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: "SOLID", color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }
  figma.closePlugin();
};
