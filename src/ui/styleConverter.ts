const convert = (jsonString: string) => {
  let items = [];
  const separator = "|";

  const isColor = value => {
    return /^#[0-9a-f]{6}$/i.test(value.toString());
  };

  const toColor = value => {
    return "0x" + value.slice(1);
  };

  let json;
  try {
    json = JSON.parse(jsonString);
  } catch (e) {
    return;
  }

  for (let i = 0; i < json.length; i++) {
    let item = json[i];
    const hasFeature = item.hasOwnProperty("featureType");
    const hasElement = item.hasOwnProperty("elementType");
    const stylers = item.stylers;
    let target = "";
    let style = "";

    if (!hasFeature && !hasElement) {
      target = "feature:all";
    } else {
      if (hasFeature) {
        target = "feature:" + item.featureType;
      }
      if (hasElement) {
        target = target ? target + separator : "";
        target += "element:" + item.elementType;
      }
    }

    for (let s = 0; s < stylers.length; s++) {
      const styleItem = stylers[s];
      const key = Object.keys(styleItem)[0];

      style = style ? style + separator : "";
      style +=
        key +
        ":" +
        (isColor(styleItem[key]) ? toColor(styleItem[key]) : styleItem[key]);
    }

    items.push(target + separator + style);
  }

  return "&style=" + items.join("&style=");
};

export { convert };
