import React from "react";

/** Wrapper : (props) => createElement(Component, props) — API toujours en objet */
export function wrap<P extends object>(Component: React.ComponentType<P>) {
  return (props: P) => React.createElement(Component, props);
}
