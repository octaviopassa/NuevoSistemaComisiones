import React from "react";
import { useGastosData } from "../../store";

export const TableResumen = () => {
  const { resumen } = useGastosData();

  return (
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
                    <td>{item.NOMBRE_GASTO}</td>
                    <td className="text-right">{item?.TOTAL}</td>
                    <td className="text-right">
                      {item?.PROMEDIO_SEMANAL}
                    </td>
                    <td className="text-right">{item?.NUMERO_SEMANAS}</td>
                    <td className="text-right">{item?.ACUMULADO}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
