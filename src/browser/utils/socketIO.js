// Socket.IO singleton initialization
// This module is imported once and handles Socket.IO connection globally

let initialized = false;

export function initSocketIO() {
  // Only run in development
  if (process.env.REACT_STATIC_ENV !== "development") {
    return;
  }

  // Only run in browser
  if (typeof window === "undefined") {
    return;
  }

  // Prevent multiple initializations across HMR and multiple imports
  if (initialized) {
    // Already initialized in this module - skip silently
    return;
  }

  // Check global window flag
  if (window.__reactStaticSocket__ && window.__reactStaticSocket__.connected) {
    // Socket already connected globally - reuse silently
    initialized = true;
    return;
  }

  // Close any existing socket (HMR cleanup)
  if (window.__reactStaticSocket__) {
    try {
      window.__reactStaticSocket__.close();
    } catch (e) {
      // Ignore errors
    }
  }

  // Mark as initialized
  initialized = true;

  const io = require("socket.io-client");
  const socket = io();
  window.__reactStaticSocket__ = socket;

  socket.on("connect", () => {
    // Silently connected - no log to avoid noise with multiple route bundles
  });

  socket.on("disconnect", () => {
    // Silently disconnected
  });

  socket.on("message", ({ type }) => {
    if (type === "reloadClientData") {
      // Import dynamically to avoid circular dependencies
      import("..").then(({ reloadClientData }) => {
        reloadClientData();
      });
    }
  });
}

// Note: initSocketIO should be called once from your application's entry point (e.g., src/app/index.tsx)
// Do NOT auto-initialize here to avoid multiple executions during webpack code splitting
