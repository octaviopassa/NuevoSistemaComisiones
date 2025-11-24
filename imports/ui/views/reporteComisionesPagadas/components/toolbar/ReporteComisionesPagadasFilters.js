import { Input } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useUserSession } from "../../../../store";
import { RepresentantesService } from "../../../../services/representantes";
import { useFiltrosReporteComisionesPagadasStore } from "../../store";
import { ClientesService, PlazasService } from "../../../../services";
import AsyncSelect from "react-select/async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const ReporteComisionesPagadasFilters = () => {
  const [representantes, setRepresentantes] = useState([]);
  const [plazas, setPlazas] = useState([]);
  const [plazaSeleccionada, setPlazaSeleccionada] = useState();
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const { filters, setFilters } = useFiltrosReporteComisionesPagadasStore();
  const { session } = useUserSession();

  useEffect(() => {
    if (!representantes.length) getRepresentantes();
    if (!plazas.length) getPlazas();
  }, []);

  useEffect(() => {
    if (plazas.map((plaza) => plaza.Codigo).includes("#")) {
      setPlazaSeleccionada("#");
      setFilters({ ...filters, plaza: "#" });
    }
  }, [plazas]);

  const getPlazas = async () => {
    try {
      const obtenerPlazas = await PlazasService.getAllGastosAdmin({
        cod_usu: session.profile.COD_USU,
        baseDatos: session.profile.baseDatos,
        servidor: session.profile.servidor,
      });

      setPlazas(
        obtenerPlazas?.map((plaza) => {
          return { Codigo: plaza.Codigo, Nombre: plaza.Nombre };
        })
      );
    } catch (error) {
      console.error("Error durante la carga inicial", error);
    }
  };

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

  const clientesOptions = async (inputValue) => {
    if (inputValue.length >= 1) {
      try {
        const clientes = await ClientesService.getAllByName({
          search: inputValue,
          codigoRepresentante: filters.codigoRepresentante || 0,
          servidor: session.profile.servidor,
        });

        return clientes.map((p) => ({
          value: p.Codigo,
          label: p.Nombre,
        }));
      } catch (error) {
        console.error("Error al cargar clientes", error);
        return [];
      }
    }
    return [];
  };

  const handleSelectCliente = (selectedOption) => {
    setClienteSeleccionado(selectedOption);
    setFilters({ ...filters, codigoCliente: selectedOption.value, nombreCliente: selectedOption.label });
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: 200,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <div className="bg-light my-3 border-top border-primary p-3 shadow-sm rounded">
      <h3>Reporte indicador de comisiones pagadas por meses</h3>
      <div className="row mt-3">
        <div className="col-sm-3 input-group">
          <div className="input-group-prepend">
            <label htmlFor="representanteSelectComisionesFilter" className="input-group-text">
              Representante
            </label>
            <select
              className="custom-select"
              id="representanteSelectComisionesFilter"
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
        <div className="col-sm-2 input-group">
          <div className="input-group-prepend">
            <label htmlFor="plazaSelect" className="input-group-text">
              Plaza
            </label>
            <select
              className="custom-select"
              id="plazaSelect"
              onChange={(e) => {
                setFilters({ ...filters, plaza: e.target.value });
                setPlazaSeleccionada(e.target.value);
              }}
              value={filters.plaza}
            >
              <option value="">Seleccione una plaza</option>
              {plazas?.map((option) => (
                <option key={option.Codigo} value={option.Codigo}>
                  {option.Nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="input-group">
            <AsyncSelect
              id="atencionCliente"
              loadOptions={clientesOptions}
              onChange={handleSelectCliente}
              placeholder="Seleccione cliente"
              value={clienteSeleccionado}
              styles={customStyles}
            />
            {filters.codigoCliente && (
              <button
                className="btn btn-primary input-group-append"
                onClick={() => {
                  setFilters({ ...filters, codigoCliente: "", nombreCliente: "" });
                  setClienteSeleccionado(null);
                }}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        </div>
        <div className="col-sm-2 input-group">
          <div className="input-group-prepend">
            <label htmlFor="fecha1ComisionesFilter" className="input-group-text">
              Fecha Inicio
            </label>
            <Input
              type="date"
              id="fecha1ComisionesFilter"
              className="w-100"
              value={filters.fecha1_Comision}
              // disabled={true}
              onChange={(e) =>
                setFilters({ ...filters, fecha1_Comision: e.target.value })
              }
            />
          </div>
        </div>
        <div className="col-sm-2 input-group">
          <div className="input-group-prepend">
            <label htmlFor="fecha2ComisionesFilter" className="input-group-text">
              Fecha Fin
            </label>
            <Input
              type="date"
              id="fecha2ComisionesFilter"
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

export { ReporteComisionesPagadasFilters };
