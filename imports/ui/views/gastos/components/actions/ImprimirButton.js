import React from "react";

export const ImprimirButton = () => {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="btn btn-secondary bg-warning-900 waves-effect waves-themed text-white ml-2 mr-2"
    >
      <i className="fal fa-print"></i> Imprimir
    </button>
  );
};
