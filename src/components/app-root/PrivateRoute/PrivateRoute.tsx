import {Component, FunctionalComponent, h} from '@stencil/core';

interface PrivateRouteProps {
  isAuthenticated: boolean;
  url: string;
  exact?: boolean;
  redirectUrl: string;
  component: string;
  componentProps?: {[key: string]: any};
}

export const PrivateRoute: FunctionalComponent<PrivateRouteProps> = ({isAuthenticated, redirectUrl, ...props}) => (
  <stencil-route {...props} routeRender={
    (props) => {
      // Component is undefined when the parent component is still loading.
      if (isAuthenticated && typeof Component !== 'undefined') {
        return <Component {...props} {...props.componentProps} />;
      }
      return <stencil-router-redirect url={redirectUrl} />;
    }
  }/>
);
