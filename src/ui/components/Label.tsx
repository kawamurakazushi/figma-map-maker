import { h } from "preact";

const Label = ({ children }) => (
  <p className="type--12-pos-bold" style={{ padding: "0 8px", margin: "8px" }}>
    {children}
  </p>
);

export { Label };
