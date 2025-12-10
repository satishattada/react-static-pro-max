import * as React from "react";

const OriginalSuspense = React.Suspense;

function Suspense({ key, children, ...rest }) {
  // During SSR (no document), always return Fragment to avoid Suspense issues
  // Check multiple conditions to be sure we're in SSR
  const isSSR = typeof document === "undefined" || 
                typeof window === "undefined" ||
                global.__REACT_STATIC_SSR__;
  
  return isSSR ? (
    <React.Fragment key={key}>{children}</React.Fragment>
  ) : (
    <OriginalSuspense key={key} {...rest}>
      {children}
    </OriginalSuspense>
  );
}

export default Suspense;
