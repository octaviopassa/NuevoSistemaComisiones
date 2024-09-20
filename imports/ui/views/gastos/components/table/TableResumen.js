import React, { useState } from "react";

export const TableResumen = () => {
  const [resumen, setResumen] = useState([]);

  return (
    <div className="col-sm-5">
      <div className="row">
        <div className="col-sm-12">
          <div className="card">
            <div className="card-body p-0 pt-3">
              <h5 className="card-title pl-3">Resumen</h5>
              <table className="table table-sm tablaResponsiva">
                <thead>
                  <tr>
                    <th className="text-center">Tipo gasto</th>
                    <th className="text-center">Total</th>
                    <th className="text-center">Pro. Semanal</th>
                    <th className="text-center">Num. Semanas</th>
                    <th className="text-center">Acumulado</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.map((item, i) => (
                    <tr key={i}>
                      <td>{item.tipoGasto}</td>
                      <td className="text-right">${item.total.toFixed(2)}</td>
                      <td className="text-right">
                        ${item.proSemanal.toFixed(2)}
                      </td>
                      <td className="text-right">{item.numSemanas}</td>
                      <td className="text-right">
                        ${item.acumulado.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3 text-center">
        <div className="col-sm-12">
          <button
            type="button"
            className="btn btn-warning bg-warning-900color-warning-900
              waves-effect waves-themed text-white mr-2"
          >
            <i className="fal fa-search"></i> Consultar
          </button>
          <button
            type="button"
            className="btn btn-primary waves-effect waves-themed mr-2"
          >
            <i className="fal fa-plus"></i> Nuevo
          </button>
          <button
            type="button"
            className="btn btn-danger waves-effect waves-themed"
          >
            <i className="fal fa-print"></i> Imprimir
          </button>
        </div>
        <div className="col-sm-2"></div>
      </div>
    </div>
  );
};
