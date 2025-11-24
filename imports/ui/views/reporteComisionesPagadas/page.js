import React, { useEffect, useState } from "react";
import { useClientPagination, useSearch } from "../../hooks";
import { Input, InputGroup, InputGroupText } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../../utils/utils";
import { useUserSession } from "../../store";
import { useFiltrosReporteComisionesPagadasStore } from "./store";
import { ReporteComisionesPagadasService } from "../../services/reporteComisionesPagadas";
import { ReporteComisionesPagadasTable } from "./components/table/ReporteComisionesPagadasTable";
import { ReporteComisionesPagadasFilters } from "./components/toolbar/ReporteComisionesPagadasFilters";
// import { ExportarPDFButton } from "./components/actions/ExportarPDFButton";

const ReporteComisionesPagadas = () => {
  const [reporteComisionesPagadas, setReporteComisionesPagadas] = useState([]);
  const { filters, setFilters } = useFiltrosReporteComisionesPagadasStore();
  const [loading, setLoading] = useState(false);
  const { searchText, setSearchText, filteredData } = useSearch(reporteComisionesPagadas || []);
  const { paginatedData, PaginationComponent, PaginationSelector } = useClientPagination(filteredData, 100);
  const { session } = useUserSession();
  // const totalPago = (filteredData || []).reduce((acc, d) => acc + (Number(d.PAGO_POR_RENGLON_VENTA) || 0), 0);
  // const totalComision = (filteredData || []).reduce((acc, d) => acc + (Number(d.COMISION_POR_RENGLON_VENTA) || 0), 0);

  useEffect(() => {
    // const params = new URLSearchParams(window.location.search);
    // const codigoRepresentante = params.get("selectedRepresentante");
    // const fecha1 = params.get("fecha1");
    // const fecha2 = params.get("fecha2");

    setFilters({
      codigoRepresentante: "",
      nombreRepresentante: "",
      plaza: "",
      codigoCliente: "",
      nombreCliente: "",
      fecha1_Comision: filters.fecha1_Comision,
      fecha2_Comision: filters.fecha2_Comision,
    });
  }, []);

  useEffect(() => {
    getReporteComisionesPagadas();
  }, [filters]);

  const getReporteComisionesPagadas = async () => {
    const fecha1_Comision = filters.fecha1_Comision ? formatDate(filters.fecha1_Comision) : null;
    const fecha2_Comision = filters.fecha2_Comision ? formatDate(filters.fecha2_Comision) : null;

    const data = {
      codigoRepresentante: filters.codigoRepresentante,
      plaza: filters.plaza == "#" ? "" : filters.plaza,
      codigoCliente: filters.codigoCliente,
      nombreCliente: filters.nombreCliente,
      fecha1_Comision,
      fecha2_Comision,
      servidor: session.profile.servidor,
    };

    try {
      setLoading(true);
      const consultaResponse = await ReporteComisionesPagadasService.consultar(data);

      setReporteComisionesPagadas(consultaResponse.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4">
      <ReporteComisionesPagadasFilters />

      <h4 className="m-0 d-flex align-items-center justify-content-left bg-primary p-3 text-white">
        Comisiones (Se muestran las comisiones de los primeros 12 meses)
      </h4>
      <div className="p-3 border border-primary shadow-sm rounded-3">
        <div className="row">
          {/* <div className="col-6 d-flex align-items-center">
            <ExportarPDFButton
              rows={filteredData}
              totalPago={totalPago}
              totalComision={totalComision}
            />
          </div> */}
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
        <ReporteComisionesPagadasTable
          comisiones={paginatedData}
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

export default ReporteComisionesPagadas;
