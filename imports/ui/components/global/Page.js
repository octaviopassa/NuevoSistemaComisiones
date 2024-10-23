import React from "react";
import { useUserModulesStore } from "../../store";

function Page(props) {
  const { allowedModules } = useUserModulesStore();
  const hasPermission = allowedModules.some((m) => m.page == props.name);
  return (
    <div style={{ padding: "10px" }}>
      {hasPermission ? props.children : <h1>Cargando...</h1>}
    </div>
  );
}

export default Page;
