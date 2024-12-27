import React from "react";
import { useGastosData } from "../store";

export const EstatusGasto = () => {
  const { estatus, setEstatus } = useGastosData();

  return (
    <div className="col-sm-3">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Estatus: {estatus.estatus}</h5>
          <div className="d-flex flex-column">
            <small className="text-muted">Grabó: {estatus.grabo}</small>
            {estatus.aplico && (
              <small className="text-muted">Aplico: {estatus.aplico}</small>
            )}
            {estatus.estatus === "AUTORIZADO" && (
              <small className="text-muted">Autorizo: {estatus.autorizo}</small>
            )}
            {estatus.estatus === "CANCELADO" && (
              <small className="text-muted">Canceló: {estatus.cancelado}</small>
            )}
          </div>
          <textarea
            className="form-control mt-3"
            id="observacionesTextarea"
            rows="5"
            placeholder="Observaciones"
            value={estatus.observaciones}
            maxLength="200"
            style={{ resize: "none" }}
            // disabled={estatus.estatus === "Nuevo"}
            onChange={(e) =>
              setEstatus({ ...estatus, observaciones: e.target.value })
            }
          ></textarea>
        </div>
      </div>
    </div>
  );
};
