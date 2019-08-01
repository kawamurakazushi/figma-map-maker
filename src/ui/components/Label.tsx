import * as React from "react";

const Label = ({ label }: { label: string }) => (
  <p className="type--11-pos-bold" style={{ padding: "0 8px", margin: "8px" }}>
    {label}
  </p>
);

export { Label };
