import { Input } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useUserSession } from "../../../../store";
import { RepresentantesService } from "../../../../services/representantes";
import { useFiltrosReporteDepositosStore } from "../../store";

const ReporteDepositosFilters = () => {
  const [representantes, setRepresentantes] = useState([]);
  const { filters, setFilters } = useFiltrosReporteDepositosStore();
  const { session } = useUserSession();

  useEffect(() => {
    if (!representantes.length) getRepresentantes();
  }, []);

  const getRepresentantes = async () => {
    try {
      const obtenerRepresentantes = await RepresentantesService.getAll({
        plaza: "#",
        servidor: session.profile.servidor,
      });
      setRepresentantes(obtenerRepresentantes);
    } catch (error) {
      console.error("Error durante la carga inicial", error);
    }
  };

  return (
    <div className="bg-light my-3 border-top border-primary p-3 shadow-sm rounded">
      <h3>Reporte de depositos por detalle ventas</h3>
      <div className="row mt-3">
        <div className="col-sm-4 input-group">
          <div className="input-group-prepend">
            <label htmlFor="representanteSelectDepositosFilter" className="input-group-text">
              Representante
            </label>
            <select
              className="custom-select"
              id="representanteSelectDepositosFilter"
              onChange={(e) => setFilters({
                ...filters,
                codigoRepresentante: e.target.value, nombreRepresentante:
                  e.target.options[e.target.selectedIndex].text
              })}
              value={filters.codigoRepresentante}
            // disabled={true}
            >
              <option value="">Seleccione un representante</option>
              {representantes.map((option) => (
                <option key={option.CODIGO_REPRESENTANTE} value={option.CODIGO_REPRESENTANTE}>
                  {option.NOMBRE_REPRESENTANTE}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-sm-3 input-group">
          <div className="input-group-prepend">
            <label htmlFor="fecha1DepositosFilter" className="input-group-text">
              Fecha Inicio
            </label>
            <Input
              type="date"
              id="fecha1DepositosFilter"
              className="w-100"
              value={filters.fecha1_Comision}
              // disabled={true}
              onChange={(e) =>
                setFilters({ ...filters, fecha1_Comision: e.target.value })
              }
            />
          </div>
        </div>
        <div className="col-sm-3 input-group">
          <div className="input-group-prepend">
            <label htmlFor="fecha2DepositosFilter" className="input-group-text">
              Fecha Fin
            </label>
            <Input
              type="date"
              id="fecha2DepositosFilter"
              value={filters.fecha2_Comision}
              // disabled={true}
              onChange={(e) =>
                setFilters({ ...filters, fecha2_Comision: e.target.value })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { ReporteDepositosFilters };
