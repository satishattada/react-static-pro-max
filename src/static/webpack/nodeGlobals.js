// Mock browser globals for Node.js SSR builds
if (typeof global !== "undefined" && typeof window === "undefined") {
  // Set a flag to indicate SSR environment
  global.__REACT_STATIC_SSR__ = true;
  
  // Don't mock window or document - this breaks SSR detection!
  // Components should use typeof document !== 'undefined' to detect browser
  
  global.navigator = {
    userAgent: "node.js",
  };
  global.location = {
    href: "",
    protocol: "http:",
    host: "localhost",
    hostname: "localhost",
    port: "",
    pathname: "/",
    search: "",
    hash: "",
  };
  global.FormData = class FormData {};
  global.XMLHttpRequest = class XMLHttpRequest {};
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  };
}
