import React from "react";
import { Spinner, Table } from "reactstrap";
import { formatCurrency, formatDate, formatNumConComas } from "../../../../../utils/utils";

const theadClasses = "d-flex justify-content-between align-items-center";

const ReporteDepositosTable = ({ depositos, loading }) => {
  return (
    <Table responsive striped bordered>
      <thead>
        <tr>
          <th style={{ width: "250px" }}>
            <span className={theadClasses}>
              <span>Depósito</span>
            </span>
          </th>
          <th style={{ width: "250px" }}>
            <span className={theadClasses}>
              <span>Fecha</span>
            </span>
          </th>
          <th style={{ width: "250px" }}>
            <span className={theadClasses}>
              <span>Folio de venta</span>
            </span>
          </th>
          <th style={{ width: "250px" }}>
            <span className={theadClasses}>
              <span>Cliente</span>
            </span>
          </th>
          <th style={{ width: "200px" }}>
            <span className={theadClasses}>
              <span>Cantidad</span>
            </span>
          </th>
          <th style={{ width: "300px" }}>
            <span className={theadClasses}>
              <span>Descripción</span>
            </span>
          </th>
          <th style={{ width: "200px" }}>
            <span className={theadClasses}>
              <span>% Utilidad</span>
            </span>
          </th>
          <th style={{ width: "200px" }}>
            <span className={theadClasses}>
              <span>Pago</span>
            </span>
          </th>
          <th style={{ width: "200px" }}>
            <span className={theadClasses}>
              <span>Comisión</span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={6} className="text-center">
              <Spinner
                color="primary"
                type="grow"
                style={{
                  height: "4rem",
                  width: "4rem",
                }}
                className="my-4"
              >
                {" "}
              </Spinner>
            </td>
          </tr>
        ) : (
          depositos?.map((deposito) => (
            <tr key={deposito.IDTRANS + "_" + deposito.R_COD_ART + "_" + deposito.IDCXC}>
              <td className="text-right">{deposito.FOLIO_DEPOSITO}</td>
              <td className="text-right">{formatDate(deposito.FECHA_DEPOSITO)}</td>
              <td className="text-right">{deposito.FOLIO_VENTA}</td>
              <td className="text-right">{deposito.COD_CTE} - {deposito.NOM_CTE}</td>
              <td className="text-left">{formatNumConComas(deposito.R_CANT)}</td>
              <td className="text-right">{deposito.R_DESCRI}</td>
              <td className="text-left">{deposito.R_PTAJE_UTILIDAD}</td>
              <td className="text-left">{formatCurrency(deposito.PAGO_POR_RENGLON_VENTA)}</td>
              <td className="text-left">{formatCurrency(deposito.COMISION_POR_RENGLON_VENTA)}</td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export { ReporteDepositosTable };
