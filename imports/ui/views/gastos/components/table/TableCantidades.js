import React from "react";
import { useGastosData } from "../../store";

export const TableCantidades = () => {
  const { documentos } = useGastosData();

  const totalImportes = documentos.reduce(
    (sumaTotales, documento) => {
      const { importes, descartado } = documento;

      if (descartado) {
        return sumaTotales;
      }

      sumaTotales.subtotal += parseFloat(importes.subtotal || 0);
      sumaTotales.total += parseFloat(importes.total || 0);
      sumaTotales.impuesto += parseFloat(importes.impuesto || 0);
      sumaTotales.iva_16 += parseFloat(importes.iva_16 || 0);
      sumaTotales.iva_8 += parseFloat(importes.iva_8 || 0);
      sumaTotales.ieps += parseFloat(importes.ieps || 0);
      sumaTotales.ish += parseFloat(importes.ish || 0);
      sumaTotales.tua += parseFloat(importes.tua || 0);
      sumaTotales.ret += parseFloat(importes.ret || 0);

      return sumaTotales;
    },
    {
      subtotal: 0,
      total: 0,
      impuesto: 0,
      iva_16: 0,
      iva_8: 0,
      ieps: 0,
      ish: 0,
      tua: 0,
      ret: 0,
    }
  );

  const totalByType = documentos.reduce(
    (suma, documento) => {
      const total = parseFloat(documento.importes.total) || 0;
      if (documento.descartado) {
        return suma;
      }

      if (documento.tipoDocumento === "Factura") {
        suma.facturas.total += total;
        suma.facturas.count += 1;
      } else if (documento.tipoDocumento === "Nota") {
        suma.notas.total += total;
        suma.notas.count += 1;
      }

      return suma;
    },
    {
      facturas: { total: 0, count: 0 },
      notas: { total: 0, count: 0 },
    }
  );

  return (
    <>
      <div className="col-sm-2">
        <div className="card">
          <div className="card-body p-0">
            <table className="table table-sm tablaResponsiva">
              <thead>
                <tr>
                  <th className="text-left">Subtotal:</th>
                  <th className="text-right">
                    <span className="badge badge-primary">
                      ${totalImportes.subtotal.toFixed(2)}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* <tr>
                  <td className="text-left">Impuesto:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${totalImportes.impuesto.toFixed(2)}
                    </span>
                  </td>
                </tr> */}
                <tr>
                  <td className="text-left">IVA_16:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${totalImportes.iva_16.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">IVA_8:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${totalImportes.iva_8.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">IEPS:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${totalImportes.ieps.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">ISH:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${totalImportes.ish.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">TUA:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${totalImportes.tua.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="text-left">Retención:</th>
                  <td className="text-right">
                    <span className="badge badge-danger">
                      ${totalImportes.ret.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="text-left">Total:</th>
                  <td className="text-right">
                    <span className="badge badge-success">
                      ${totalImportes.total.toFixed(2)}
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
                    <span className="badge badge-primary">
                      ${totalByType.facturas.total.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">Cantidad:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      {totalByType.facturas.count}
                    </span>
                  </td>
                </tr>
                <tr>
                  <th className="text-left">Notas</th>
                  <td className="text-right"></td>
                </tr>
                <tr>
                  <td className="text-left">Importe:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      ${totalByType.notas.total.toFixed(2)}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="text-left">Cantidad:</td>
                  <td className="text-right">
                    <span className="badge badge-primary">
                      {totalByType.notas.count}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};
