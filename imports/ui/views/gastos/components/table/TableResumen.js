import React, { useState } from "react";

export const TableResumen = () => {
  const [observaciones, setObservaciones] = useState("");
  const [resumen, setResumen] = useState([]);
  const [xmlData, setXmlData] = useState(null);

  return (
    <div className="row">
      <div className="col-sm-3">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Estatus: GRABADO</h5>
            <small className="text-muted">
              Grabó: GILBERTO_MENDOZA 06/07/2024
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
      <div className="col-sm-2">
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-sm tablaResponsiva">
              <thead>
                <tr>
                  <th className="text-left">Subtotal:</th>
                  <th className="text-right">
                    <span className="badge badge-primary">
                      $
                      {xmlData
                        ? parseFloat(xmlData.subtotal).toFixed(2)
                        : "0.00"}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left">IVA:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${xmlData ? parseFloat(xmlData.iva).toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">IVA_16:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      $
                      {xmlData ? parseFloat(xmlData.iva_16).toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">IVA_8:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${xmlData ? parseFloat(xmlData.iva_8).toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">IEPS:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${xmlData ? parseFloat(xmlData.ieps).toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">ISH:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${xmlData ? parseFloat(xmlData.ish).toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">TUA:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${xmlData ? parseFloat(xmlData.tua).toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="text-left">Retención:</th>
                  <td className="text-right">
                    <span className="badge badge-danger">
                      $
                      {xmlData
                        ? parseFloat(xmlData.retencion).toFixed(2)
                        : "0.00"}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="text-left">Total:</th>
                  <td className="text-right">
                    <span className="badge badge-success">
                      ${xmlData ? parseFloat(xmlData.total).toFixed(2) : "0.00"}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="col-sm-2">
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-sm tablaResponsiva">
              <thead>
                <tr>
                  <th className="text-left">Facturas</th>
                  <th className="text-right"></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-left">Importe:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">$423.40</span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">Cantidad:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">2</span>
                  </td>
                </tr>
                <tr>
                  <th className="text-left">Notas</th>
                  <td className="text-right"></td>
                </tr>
                <tr>
                  <td className="text-left">Importe:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">$550.00</span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">Cantidad:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">1</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
