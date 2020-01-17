import {FunctionalComponent, h} from '@stencil/core';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  url: string;
  exact?: boolean;
  redirectUrl: string;
  component: string;
  componentProps?: {[key: string]: any};
}

export const PrivateRoute: FunctionalComponent<PrivateRouteProps> =
  ({isAuthenticated, redirectUrl, component, ...props}) => (
  <stencil-route {...props} routeRender={
    (props) => {
      const Component = component;
      if (isAuthenticated) {
        return <Component {...props} {...props.componentProps} />;
      }
      return <stencil-router-redirect url={redirectUrl} />;
    }
  }/>
);
