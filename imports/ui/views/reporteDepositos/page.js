import React, { useEffect, useState } from "react";
import { useClientPagination, useSearch } from "../../hooks";
import { Input, InputGroup, InputGroupText } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { formatDate } from "../../../utils/utils";
import { useFiltrosReporteDepositosStore } from "./store";
import { ReporteDepositosService } from "../../services/reporteDepositos";
import { ReporteDepositosTable } from "./components/table/ReporteDepositosTable";
import { ReporteDepositosFilters } from "./components/toolbar/ReporteDepositosFilters";
import { ExportarPDFButton } from "./components/actions/ExportarPDFButton";

const ReporteDepositos = () => {
  const [reporteDepositos, setReporteDepositos] = useState([]);
  const { filters, setFilters } = useFiltrosReporteDepositosStore();
  const [loading, setLoading] = useState(false);
  const { searchText, setSearchText, filteredData } = useSearch(reporteDepositos || []);
  const { paginatedData, PaginationComponent, PaginationSelector } = useClientPagination(filteredData, 100);
  const totalPago = (filteredData || []).reduce((acc, d) => acc + (Number(d.PAGO_POR_RENGLON_VENTA) || 0), 0);
  const totalComision = (filteredData || []).reduce((acc, d) => acc + (Number(d.COMISION_POR_RENGLON_VENTA) || 0), 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codigoRepresentante = params.get("selectedRepresentante");
    const fecha1 = params.get("fecha1");
    const fecha2 = params.get("fecha2");

    setFilters({
      codigoRepresentante: codigoRepresentante,
      fecha1_Comision: fecha1,
      fecha2_Comision: fecha2,
    });
  }, []);

  useEffect(() => {
    getReporteDepositos();
  }, [filters]);

  const getReporteDepositos = async () => {
    const fecha1_Comision = filters.fecha1_Comision ? formatDate(filters.fecha1_Comision) : null;
    const fecha2_Comision = filters.fecha2_Comision ? formatDate(filters.fecha2_Comision) : null;

    const data = {
      codigoRepresentante: filters.codigoRepresentante,
      fecha1_Comision,
      fecha2_Comision,
    };

    try {
      setLoading(true);
      const consultaResponse = await ReporteDepositosService.consultar(data);
      setReporteDepositos(consultaResponse.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid px-4">
      <ReporteDepositosFilters />

      <h4 className="m-0 d-flex align-items-center justify-content-left bg-primary p-3 text-white">
        Comisiones
      </h4>
      <div className="p-3 border border-primary shadow-sm rounded-3">
        <div className="row">
          <div className="col-6 d-flex align-items-center">
            <ExportarPDFButton
              rows={filteredData}
              totalPago={totalPago}
              totalComision={totalComision}
            />
          </div>
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
        <ReporteDepositosTable
          depositos={paginatedData}
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

export default ReporteDepositos;
