import React, { useState } from "react";
import { GastosAdminFilters, GastosAdminTable } from "./components";
import { useClientPagination, useSearch } from "../../hooks";
import { Input, InputGroup, InputGroupText } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const GastosAdmin = () => {
  const [gastos, setGastos] = useState([]);
  const { searchText, setSearchText, filteredData } = useSearch(gastos || []);
  const { paginatedData, PaginationComponent, PaginationSelector } =
    useClientPagination(filteredData);

  return (
    <div className="container-fluid px-4">
      <GastosAdminFilters setGastos={setGastos} />

      <h4 className="m-0 d-flex align-items-center justify-content-left bg-primary p-3 text-white">
        Gastos
      </h4>
      <div className="p-3 border border-primary shadow-sm rounded-3">
        <div className="row">
          <h5 className="col-6 text-left m-0 d-flex align-items-center mb-3">
            Mostrar Menu Gastos
          </h5>
          <div className="col-6 d-flex justify-content-end">
            <InputGroup className="mb-3">
              <Input
                placeholder="Buscar..."
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />
              <InputGroupText>
                <FontAwesomeIcon icon={faSearch} />
              </InputGroupText>
            </InputGroup>
          </div>
        </div>
        <GastosAdminTable gastos={paginatedData} />

        <div className="row mt-2">
          <div className="col-sm-6 col-12">
            <PaginationComponent />
          </div>

          <div className="col-sm-6 col-12 d-flex justify-content-end align-items-center">
            <p className="text-muted mb-0 mr-2">Items por página: </p>
            <PaginationSelector />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GastosAdmin;
