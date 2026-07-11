import React from "react";
import { Spinner, Table } from "reactstrap";
import { formatCurrency } from "../../../../../utils/utils";

const theadClasses = "d-flex justify-content-between align-items-center";

const ReporteComisionesPagadasDesglosadoTable = ({ comisiones, loading }) => {
  const encabezados = comisiones.length > 0 ? comisiones[0] : null;
  const comisionesAgrupadas = comisiones.reduce((acc, comision) => {
    const representante = comision.NOMBRE_REPRESENTANTE;
    if (!acc[representante]) {
      acc[representante] = [];
    }
    acc[representante].push(comision);
    return acc;
  }, {});

  // Función para calcular total general de una comisión
  const calcularTotalComision = (comision) => {
    return (comision.HUBO_DATOS_MES_01 || 0) +
      (comision.HUBO_DATOS_MES_02 || 0) +
      (comision.HUBO_DATOS_MES_03 || 0) +
      (comision.HUBO_DATOS_MES_04 || 0) +
      (comision.HUBO_DATOS_MES_05 || 0) +
      (comision.HUBO_DATOS_MES_06 || 0) +
      (comision.HUBO_DATOS_MES_07 || 0) +
      (comision.HUBO_DATOS_MES_08 || 0) +
      (comision.HUBO_DATOS_MES_09 || 0) +
      (comision.HUBO_DATOS_MES_10 || 0) +
      (comision.HUBO_DATOS_MES_11 || 0) +
      (comision.HUBO_DATOS_MES_12 || 0);
  };

  // Función para calcular totales por mes y total general por representante
  const calcularTotalesRepresentante = (comisionesGroup) => {
    const totales = {
      MES_01: 0,
      MES_02: 0,
      MES_03: 0,
      MES_04: 0,
      MES_05: 0,
      MES_06: 0,
      MES_07: 0,
      MES_08: 0,
      MES_09: 0,
      MES_10: 0,
      MES_11: 0,
      MES_12: 0,
      GENERAL: 0,
    };

    comisionesGroup.forEach(comision => {
      totales.MES_01 += comision.HUBO_DATOS_MES_01 || 0;
      totales.MES_02 += comision.HUBO_DATOS_MES_02 || 0;
      totales.MES_03 += comision.HUBO_DATOS_MES_03 || 0;
      totales.MES_04 += comision.HUBO_DATOS_MES_04 || 0;
      totales.MES_05 += comision.HUBO_DATOS_MES_05 || 0;
      totales.MES_06 += comision.HUBO_DATOS_MES_06 || 0;
      totales.MES_07 += comision.HUBO_DATOS_MES_07 || 0;
      totales.MES_08 += comision.HUBO_DATOS_MES_08 || 0;
      totales.MES_09 += comision.HUBO_DATOS_MES_09 || 0;
      totales.MES_10 += comision.HUBO_DATOS_MES_10 || 0;
      totales.MES_11 += comision.HUBO_DATOS_MES_11 || 0;
      totales.MES_12 += comision.HUBO_DATOS_MES_12 || 0;
    });

    // Calcular total general
    totales.GENERAL = totales.MES_01 + totales.MES_02 + totales.MES_03 +
      totales.MES_04 + totales.MES_05 + totales.MES_06 +
      totales.MES_07 + totales.MES_08 + totales.MES_09 +
      totales.MES_10 + totales.MES_11 + totales.MES_12;

    return totales;
  };

  return (
    <Table responsive striped bordered>
      <thead>
        <tr>
          <th style={{ width: "250px" }}>
            <span className={theadClasses}>
              <span>Representante</span>
            </span>
          </th>
          <th style={{ width: "250px" }}>
            <span className={theadClasses}>
              <span>Cliente</span>
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
          <th style={{ width: "120px" }}>
            <span className={theadClasses}>
              <span>Total</span>
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
          Object.entries(comisionesAgrupadas).map(([representante, comisionesGroup]) => {
            const totales = calcularTotalesRepresentante(comisionesGroup);
            return (
              <React.Fragment key={representante}>
                {comisionesGroup.map((comision, index) => {
                  const totalComision = calcularTotalComision(comision);
                  return (
                    <tr key={comision.CLIENTE}>
                      {index === 0 ? (
                        <td className="text-left" rowSpan={comisionesGroup.length}>
                          {representante}
                        </td>
                      ) : null}
                      <td className="text-left">{comision.CLIENTE}</td>
                      {comision.HUBO_DATOS_MES_01 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_01)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_02 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_02)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_03 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_03)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_04 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_04)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_05 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_05)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_06 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_06)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_07 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_07)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_08 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_08)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_09 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_09)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_10 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_10)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_11 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_11)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {comision.HUBO_DATOS_MES_12 !== 0 ? (
                        <td className="text-center">{formatCurrency(comision.HUBO_DATOS_MES_12)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                      {totalComision !== 0 ? (
                        <td className="text-center font-weight-bold">{formatCurrency(totalComision)}</td>
                      ) : (
                        <td className="text-center"></td>
                      )}
                    </tr>
                  );
                })}
                <tr className="table-info font-weight-bold">
                  <td colSpan={2} className="text-left">
                    Total:
                  </td>
                  <td className="text-center">{totales.MES_01 !== 0 ? formatCurrency(totales.MES_01) : ''}</td>
                  <td className="text-center">{totales.MES_02 !== 0 ? formatCurrency(totales.MES_02) : ''}</td>
                  <td className="text-center">{totales.MES_03 !== 0 ? formatCurrency(totales.MES_03) : ''}</td>
                  <td className="text-center">{totales.MES_04 !== 0 ? formatCurrency(totales.MES_04) : ''}</td>
                  <td className="text-center">{totales.MES_05 !== 0 ? formatCurrency(totales.MES_05) : ''}</td>
                  <td className="text-center">{totales.MES_06 !== 0 ? formatCurrency(totales.MES_06) : ''}</td>
                  <td className="text-center">{totales.MES_07 !== 0 ? formatCurrency(totales.MES_07) : ''}</td>
                  <td className="text-center">{totales.MES_08 !== 0 ? formatCurrency(totales.MES_08) : ''}</td>
                  <td className="text-center">{totales.MES_09 !== 0 ? formatCurrency(totales.MES_09) : ''}</td>
                  <td className="text-center">{totales.MES_10 !== 0 ? formatCurrency(totales.MES_10) : ''}</td>
                  <td className="text-center">{totales.MES_11 !== 0 ? formatCurrency(totales.MES_11) : ''}</td>
                  <td className="text-center">{totales.MES_12 !== 0 ? formatCurrency(totales.MES_12) : ''}</td>
                  <td className="text-center">{formatCurrency(totales.GENERAL)}</td>
                </tr>
              </React.Fragment>
            );
          })
        )}
      </tbody>
    </Table>
  );
};

export { ReporteComisionesPagadasDesglosadoTable };
