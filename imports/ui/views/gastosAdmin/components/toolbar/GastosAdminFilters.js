import React from "react";

const statusOptions = [
  { value: "G", label: "Grabado" },
  { value: "U", label: "Aprobado" },
  { value: "C", label: "Cancelado" },
];

const plazaOptions = [
  { value: "0", label: "Todos" },
  { value: "1", label: "Plaza A" },
  { value: "2", label: "Plaza B" },
  { value: "3", label: "Plaza C" },
];

const vendedorOptions = [
  { value: "0", label: "Todos" },
  { value: "1", label: "Vendedor 1" },
  { value: "2", label: "Vendedor 2" },
  { value: "3", label: "Vendedor 3" },
];

const GastosAdminFilters = ({ setGastos }) => {
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
              onChange={(e) => {
                console.log(e.target.value);
              }}
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

        <div className="col-sm-2 input-group">
          <div className="input-group-prepend">
            <label htmlFor="plazaSelect" className="input-group-text">
              Plaza
            </label>
            <select
              className="custom-select"
              id="plazaSelect"
              onChange={(e) => {
                console.log(e.target.value);
              }}
            >
              <option value="">Seleccione una plaza</option>
              {plazaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
                console.log(e.target.value);
              }}
            >
              <option value="">Seleccione un vendedor</option>
              {vendedorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export { GastosAdminFilters };
