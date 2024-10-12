import React from "react";
import { useNavigate } from "react-router-dom";

const ConsultarButton = () => {
  const navigate = useNavigate();
  const handleConsult = () => {
    navigate("/gastos/administracion");
  };
  return (
    <button
      type="button"
      className="btn btn-warning text-white waves-effect waves-themed mr-2"
      onClick={handleConsult}
    >
      <i className="fal fa-search"></i> Consultar
    </button>
  );
};

export { ConsultarButton };
