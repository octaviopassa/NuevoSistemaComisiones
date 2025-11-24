import React from "react";
import { Spinner, Table } from "reactstrap";
// import { formatCurrency, formatDate, formatNumConComas } from "../../../../../utils/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const theadClasses = "d-flex justify-content-between align-items-center";

const ReporteComisionesPagadasTable = ({ comisiones, loading }) => {
  // const totalPago = (comisiones || []).reduce((acc, d) => acc + (Number(d.PAGO_POR_RENGLON_VENTA) || 0), 0);
  // const totalComision = (comisiones || []).reduce((acc, d) => acc + (Number(d.COMISION_POR_RENGLON_VENTA) || 0), 0);
  const encabezados = comisiones.length > 0 ? comisiones[0] : null;
  return (
    <Table responsive striped bordered>
      <thead>
        <tr>
          <th style={{ width: "250px" }}>
            <span className={theadClasses}>
              <span>Representante</span>
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_01}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_02}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_03}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_04}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_05}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_06}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_07}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_08}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_09}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_10}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_11}</span>}
            </span>
          </th>
          <th style={{ width: "100px" }}>
            <span className={theadClasses}>
              {encabezados && <span>{encabezados.NOMBRE_MES_12}</span>}
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
          comisiones?.map((comision) => (
            <tr key={comision.NOMBRE_REPRESENTANTE}>
              <td className="text-left">{comision.NOMBRE_REPRESENTANTE}</td>
              {comision.HUBO_DATOS_MES_01 === 1 ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_02 === 1 ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_03 === 1 ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_04 === 1 ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_05 === 1 ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_06 === "1" ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_07 === "1" ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_08 === "1" ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_09 === "1" ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_10 === "1" ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_11 === "1" ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {comision.HUBO_DATOS_MES_12 === "1" ? (
                <td className="text-center"><FontAwesomeIcon icon={faCheck} color="green" /></td>
              ) : (
                <td className="text-center"></td>
              )}
              {/* <td className="text-right">{comision.HUBO_DATOS_MES_01}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_02}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_03}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_04}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_05}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_06}</td>              
              <td className="text-right">{comision.HUBO_DATOS_MES_07}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_08}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_09}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_10}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_11}</td>
              <td className="text-right">{comision.HUBO_DATOS_MES_12}</td> */}
            </tr>
          ))
        )}
      </tbody>
      {/* {!loading && (
        <tfoot>
          <tr>
            <td colSpan={7} className="text-right font-weight-bold">Totales</td>
            <td className="text-left font-weight-bold">{formatCurrency(totalPago)}</td>
            <td className="text-left font-weight-bold">{formatCurrency(totalComision)}</td>
          </tr>
        </tfoot>
      )} */}
    </Table>
  );
};

export { ReporteComisionesPagadasTable };
