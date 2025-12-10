import React from "react";

// Always use the same context instance, regardless of environment
// The default value will be overridden by the Provider in bootstrapApp
const context = React.createContext(
  typeof document !== "undefined" ? window.__routeInfo : {}
);

export default context;
