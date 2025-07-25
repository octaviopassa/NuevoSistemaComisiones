import React, { useEffect, useState } from "react";
import { GastosAdminFilters, GastosAdminTable } from "./components";
import { useClientPagination, useSearch } from "../../hooks";
import { Input, InputGroup, InputGroupText } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { GastosService } from "../../services";
import { useUserSession } from "../../store";
import toastr from "toastr";
import { formatDate, formatToSinaloaDate } from "../../../utils/utils";
import { useFiltersStore } from "./store";

const GastosAdmin = () => {
  const [gastos, setGastos] = useState([]);
  const { filters, setFilters } = useFiltersStore();
  const [loading, setLoading] = useState(false);
  const { session } = useUserSession();
  const { searchText, setSearchText, filteredData } = useSearch(gastos || []);
  const { paginatedData, PaginationComponent, PaginationSelector } =
    useClientPagination(filteredData);

  useEffect(() => {
    if (filters.recargarDespuesDeAutorizar) {
      setFilters({ ...filters, recargarDespuesDeAutorizar: false });
    }
    getGastos();
  }, [filters]);

  const getGastos = async () => {
    if (!filters.estatus || !filters.plaza) {
      if (gastos.length > 0) {
        toastr.warning("Estatus y Plaza son obligatorios");
        setGastos([]);
        return;
      }
      return;
    }

    const fechaInicio = filters.usarFiltroFecha ? formatDate(filters.fechaInicio) : null;
    const fechaFin = filters.usarFiltroFecha ? formatDate(filters.fechaFin) : null;

    const data = {
      ...filters,
      vendedor: filters.vendedor || "0",
      fechaInicio,
      fechaFin,
      cod_usu: session.profile.TIENE_ACCESO_VER_TODOS_GASTOS
        ? "0"
        : session.profile.COD_USU,
      servidor: session.profile.servidor,
    };

    try {
      setLoading(true);
      const consultaResponse = await GastosService.consultar(data);

      setGastos(consultaResponse.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4">
      <GastosAdminFilters />

      <h4 className="m-0 d-flex align-items-center justify-content-left bg-primary p-3 text-white">
        Comisiones
      </h4>
      <div className="p-3 border border-primary shadow-sm rounded-3">
        <div className="row">
          {/* <h5 className="col-6 text-left m-0 d-flex align-items-center mb-3">
            Mostrar Menu Gastos
          </h5> */}
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
        <GastosAdminTable
          gastos={paginatedData}
          plazaSeleccionada={filters.plaza}
          loading={loading}
        />

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
