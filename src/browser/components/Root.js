import React from "react";
//
import { plugins } from "..";

// Check if we're in a browser environment
const isBrowser = typeof document !== 'undefined';

export default function Root({ children }) {
  // For SSR, just use a simple passthrough without hooks
  if (!isBrowser) {
    const SimpleRoot = plugins.Root(({ children }) => children);
    return <SimpleRoot>{children}</SimpleRoot>;
  }

  // For browser, use hooks for error handling and HMR
  const ResolvedRoot = React.useMemo(
    () => plugins.Root(({ children }) => children),
    [plugins],
  );

  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (module && module.hot) {
      const hotReloadHandler = (status) => {
        if (status === "idle") {
          setError(null);
        }
      };
      module.hot.addStatusHandler(hotReloadHandler);
      return () => {
        module.hot.removeStatusHandler(hotReloadHandler);
      };
    }
  });

  return (
    <Catch onCatch={setError}>
      {error ? (
        <pre
          style={{
            display: "block",
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            background: "#222",
            color: "white",
            margin: 0,
            padding: "1rem",
            overflow: "scroll",
            fontSize: "14px",
          }}
        >
          {`An internal error occured!

${
  process.env.NODE_ENV === "production"
    ? "Please see the console for more details."
    : error.stack
}
          `}
        </pre>
      ) : (
        <ResolvedRoot>{children}</ResolvedRoot>
      )}
    </Catch>
  );
}

class Catch extends React.Component {
  componentDidCatch(error) {
    this.props.onCatch(error);
  }

  render() {
    return this.props.children;
  }
}
