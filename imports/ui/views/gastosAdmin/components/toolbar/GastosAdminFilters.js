import React, { useEffect, useState } from "react";
import { IngenierosService, PlazasService } from "../../../../services";
import { useUserSession } from "../../../../store";
import { Input } from "reactstrap";
import { format, subMonths } from "date-fns";

const statusOptions = [
  { value: "G", label: "Grabado" },
  { value: "U", label: "Aprobado" },
  { value: "C", label: "Cancelado" },
];

const GastosAdminFilters = ({ filters, setFilters }) => {
  const [plazas, setPlazas] = useState([]);
  const [plazaSeleccionada, setPlazaSeleccionada] = useState();
  const [vendedores, setVendedores] = useState([]);
  const [dateFilterVisible, setDateFilterVisible] = useState(true);
  const { session } = useUserSession();

  useEffect(() => {
    if (!plazas.length) getPlazas();
  }, []);

  useEffect(() => {
    if (plazaSeleccionada) {
      getVendedores();
    }
  }, [plazaSeleccionada]);

  const getPlazas = async () => {
    try {
      const obtenerPlazas = await PlazasService.getAll({
        cod_usu: session.profile.COD_USU,
        baseDatos: session.profile.baseDatos,
        servidor: session.profile.servidor,
      });

      setPlazas(
        obtenerPlazas?.map((plaza) => {
          return { Codigo: plaza.CODIGO, Nombre: plaza.NOMBRE };
        })
      );
    } catch (error) {
      console.error("Error durante la carga inicial", error);
    }
  };

  const getVendedores = async () => {
    try {
      const obtenerVendedores = await IngenierosService.getAll({
        plaza: plazaSeleccionada,
        baseDatos: session.profile.baseDatos,
        servidor: session.profile.servidor,
      });
      setVendedores(obtenerVendedores);
    } catch (error) {
      console.error("Error durante la carga inicial", error);
    }
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setDateFilterVisible(isChecked);

    if (isChecked) {
      const fechaActual = new Date();
      const fechaInicio = subMonths(new Date(), 1);

      setFilters((prevFilters) => ({
        ...prevFilters,
        fechaInicio: format(fechaInicio, "yyyy-MM-dd"),
        fechaFin: format(fechaActual, "yyyy-MM-dd"),
      }));
    } else {
      setFilters((prevFilters) => ({
        ...prevFilters,
        fechaInicio: "",
        fechaFin: "",
      }));
    }
  };

  return (
    <div className="bg-light my-3 border-top border-primary p-3 shadow-sm rounded">
      <h3>Filtros</h3>

      <div className="row mt-3">
        <div className="col-sm-2 input-group">
          <div className="input-group-prepend">
            <label htmlFor="statusSelect" className="input-group-text">
              Estatus
            </label>
            <select
              className="custom-select"
              id="statusSelect"
              onChange={(e) =>
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  estatus: e.target.value,
                }))
              }
              value={filters.estatus}
            >
              <option value="">Seleccione un estatus</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-sm-2">
          <div className="input-group-prepend">
            <label htmlFor="plazaSelect" className="input-group-text">
              Plaza
            </label>
            <select
              className="custom-select"
              id="plazaSelect"
              onChange={(e) => {
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  plaza: e.target.value,
                }));
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

        <div className="col-sm-2 input-group">
          <div className="input-group-prepend">
            <label htmlFor="vendedorSelect" className="input-group-text">
              Vendedor
            </label>
            <select
              className="custom-select"
              id="vendedorSelect"
              onChange={(e) => {
                setFilters((prevFilters) => ({
                  ...prevFilters,
                  vendedor: e.target.value,
                }));
              }}
              value={filters.vendedor}
            >
              <option value="">Seleccione un vendedor</option>
              {vendedores.map((option) => (
                <option key={option.Codigo} value={option.Codigo}>
                  {option.Nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="col-sm-1">
          <div className="d-flex align-items-center">
            <div className="input-group-prepend">
              <label htmlFor="dateSelect" className="input-group-text">
                Fecha
              </label>
            </div>
            <Input
              addon
              id="dateSelect"
              className="input-group-text"
              aria-label="Checkbox for following text input"
              type="checkbox"
              onChange={handleCheckboxChange}
              checked={dateFilterVisible}
            />
          </div>
        </div>
      </div>
      {dateFilterVisible && (
        <div className="row mt-3 justify-content-end">
          <div className="col-sm-3 input-group">
            <div className="input-group-prepend">
              <label htmlFor="fechaInicio" className="input-group-text">
                Fecha Inicio
              </label>
              <Input
                type="date"
                id="fechaInicio"
                className="w-100"
                value={filters.fechaInicio}
                onChange={(e) =>
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    fechaInicio: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="col-sm-3 input-group">
            <div className="input-group-prepend">
              <label htmlFor="fechaFin" className="input-group-text">
                Fecha Fin
              </label>
              <Input
                type="date"
                id="fechaFin"
                value={filters.fechaFin}
                onChange={(e) =>
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    fechaFin: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { GastosAdminFilters };
