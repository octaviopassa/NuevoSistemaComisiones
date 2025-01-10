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
            {estatus.grabo && (
              <small className="text-muted">Grabó: {estatus.grabo}</small>
            )}
            {estatus.aplico && (
              <small className="text-muted">Aplicó: {estatus.aplico}</small>
            )}
            {estatus.autorizo && (
              <small className="text-muted">Autorizó: {estatus.autorizo}</small>
            )}
            {estatus.cancelado && (
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
