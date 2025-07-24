import { useState } from "react";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Spinner, Table } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { formatDate, formatToSinaloaDate } from "../../../../../utils/utils";

const theadClasses = "d-flex justify-content-between align-items-center";

// TODO: Si se requiere a futuro separar la lógica del sort del componente y hacerlo un custom hook
const GastosAdminTable = ({ gastos, plazaSeleccionada, loading }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const navigate = useNavigate();

  const handleSort = (key) => {
    let direction = "asc";

    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = null;
      } else {
        direction = "asc";
      }
    }

    setSortConfig({ key, direction });
    if (direction) {
      sortData(key, direction);
    }
  };

  const sortData = (key, direction) => {
    gastos.sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  const getIcon = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.direction === "asc") return faSortUp;
      if (sortConfig.direction === "desc") return faSortDown;
    }
    return faSort;
  };

  // const handleVerGasto = (gasto) => {    
  //   navigate("/gastos", { state: { folio: gasto.FOLIO_GASTO, plaza: gasto.PLAZA} });
  // };

  const handleVerGasto = (gasto) => {
    navigate(`/gastos?folio=${gasto.FOLIO_GASTO}&plaza=${gasto.PLAZA}`);
  };

  return (
    <Table responsive striped bordered>
      <thead>
        <tr>
          <th onClick={() => handleSort("folio")}>
            <span className={theadClasses}>
              <span>Folio</span>
              <FontAwesomeIcon cursor={"pointer"} icon={getIcon("folio")} />
            </span>
          </th>
          <th onClick={() => handleSort("fecha")}>
            <span className={theadClasses}>
              <span>Fecha</span>
              <FontAwesomeIcon cursor={"pointer"} icon={getIcon("fecha")} />
            </span>
          </th>
          <th onClick={() => handleSort("plaza")}>
            <span className={theadClasses}>
              <span>Plaza</span>
              <FontAwesomeIcon cursor={"pointer"} icon={getIcon("plaza")} />
            </span>
          </th>
          <th onClick={() => handleSort("registro")}>
            <span className={theadClasses}>
              <span>Registró</span>
              <FontAwesomeIcon cursor={"pointer"} icon={getIcon("registro")} />
            </span>
          </th>
          <th onClick={() => handleSort("total")}>
            <span className={theadClasses}>
              <span>Total</span>
              <FontAwesomeIcon cursor={"pointer"} icon={getIcon("total")} />
            </span>
          </th>
          <th style={{ width: "20px" }}>Acciones</th>
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
          gastos?.map((gasto) => (
            <tr key={gasto.ID_GASTO_GLOBAL}>
              <td>{gasto.FOLIO_GASTO}</td>
              <td>{formatDate(gasto.FECHA)}</td>
              {/* <td>{format(new Date(gasto.FECHA), "dd/MM/yyyy")}</td> */}
              <td>{`${gasto.PLAZA} - ${gasto.NOM_PLAZA}`}</td>
              <td>
                {gasto.Registró.match(/<b>Usuario:<\/b>\s*([A-Z_]+)/)?.[1]
                  .split("_")
                  .map(
                    (word) =>
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  )
                  .join(" ")}{" "}
                {gasto.Registró.match(/<b>Vendedor: <\/b>(.*)/)?.[1] && (
                  <>
                    - <br />
                    <b>Vendedor: </b>
                    {gasto.Registró.match(/<b>Vendedor: <\/b>(.*)/)[1]
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ")}
                  </>
                )}
              </td>
              <td>{gasto.TOTAL}</td>
              <td>
                <button
                  className="btn btn-link"
                  onClick={() => handleVerGasto(gasto)}
                >
                  Ver
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </Table>
  );
};

export { GastosAdminTable };
