import { useState } from "react";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Table } from "reactstrap";

const theadClasses = "d-flex justify-content-between align-items-center";

// TODO: Si se requiere a futuro separar la lógica del sort del componente y hacerlo un custom hook
const GastosAdminTable = ({ gastos }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

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

  // Ordenar los datos
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
        </tr>
      </thead>
      <tbody>
        {gastos?.map((gasto) => (
          <tr key={gasto._id}>
            <td>{gasto.folio}</td>
            <td>{gasto.fecha}</td>
            <td>{gasto.plaza}</td>
            <td>{gasto.registro}</td>
            <td>{gasto.total}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export { GastosAdminTable };
