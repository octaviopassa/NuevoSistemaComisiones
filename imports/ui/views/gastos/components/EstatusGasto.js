import React, { useState } from "react";

export const EstatusGasto = () => {
  const [observaciones, setObservaciones] = useState("");

  return (
    <div className="col-sm-3">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Estatus: NUEVO</h5>
          <small className="text-muted">
            Grabó: 
          </small>
          <textarea
            className="form-control mt-3"
            id="observacionesTextarea"
            rows="5"
            placeholder="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          ></textarea>
        </div>
      </div>
    </div>
  );
};
