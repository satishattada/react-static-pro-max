import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Create our own withRouter using React Router v6 hooks
function withRouter(Component) {
  return function ComponentWithRouterProp(props) {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();

    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
        location={location}
        navigate={navigate}
        params={params}
      />
    );
  };
}

// Location component using hooks instead of withRouter
function Location({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  return children({
    location,
    navigate,
    params,
    router: { location, navigate, params },
  });
}

export default () => ({
  Root:
    (PreviousRoot) =>
    ({ children, ...rest }) => {
      return <PreviousRoot {...rest}>{children}</PreviousRoot>;
    },
  Routes: (PreviousRoutes) => (props) => {
    return <PreviousRoutes {...props} />;
  },
  Location,
  withRouter,
});
