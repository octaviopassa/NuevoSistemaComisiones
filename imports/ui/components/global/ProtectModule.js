import React, { useState } from "react";
import PropTypes from "prop-types";
import useUserModulesStore from "../../store/userModules";
// import { useSelector } from "react-redux"
// import { PageContext } from "./Page"

function ProtectModule({ method, module, ...props }) {
  const { allowedModules } = useUserModulesStore();
  // const user = useSelector(state => state.user)
  const page = props.page;

  const hasPermission = allowedModules.some(
    (m) => m.name == module && m.page == page
  );
  if (props.ifNot && !hasPermission) return props.ifNot;

  switch (method) {
    case "disable":
      return React.cloneElement(props.children, { disabled: !hasPermission });

    case "hide":
      if (!hasPermission)
        return React.cloneElement(props.children, {
          style: { display: "none" },
        });

      return React.cloneElement(props.children, {});

    case "remove":
      return !hasPermission ? null : props.children;

    default:
      return null;
  }
}

ProtectModule.propTypes = {
  children: PropTypes.node.isRequired,
  /**
   * disable = Muestra el componente a proteger como deshabilitado
   * hide = Oculta el componente a proteger
   * remove = Elimina el componente a proteger del codigo final que recibe el usuario
   */
  method: PropTypes.oneOf(["disable", "hide", "remove"]),
  module: PropTypes.string.isRequired,
};

export default ProtectModule;
