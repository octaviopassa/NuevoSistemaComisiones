import React, { useEffect, useState } from "react";
import ClientesService from "../../../../services/clientes";
import CombustiblesService from "../../../../services/combustible";
import GastosService from "../../../../services/gastos";
import IngenierosService from "../../../../services/ingenieros";
import PlazasService from "../../../../services/plazas";
import TipoGastosService from "../../../../services/tipoGastos";
import { ModalPlaza } from "../modals";

export const GastosToolbar = ({
  plazaSeleccionada,
  setClientesVisible,
  setCombustibles,
  setPlazaSeleccionada,
  setTipoGastos,
  user,
}) => {
  const [plazas, setPlazas] = useState([]);
  const [isCheckedSucursal, setIsCheckedSucursal] = useState(true);
  const [isCheckedIngeniero, setIsCheckedIngeniero] = useState(false);
  const [selectedIngeniero, setSelectedIngeniero] = useState("");
  const [folio, setFolio] = useState("");
  const [pagarA, setPagarA] = useState([]);
  const [pagarASeleccionado, setPagarASeleccionado] = useState("");
  const [ingenieros, setIngenieros] = useState([]);

  useEffect(() => {
    const cargaInicial = async () => {
      try {
        setIsCheckedIngeniero(false);
        setIsCheckedSucursal(true);

        const obtenerPlazas = await PlazasService.getAll({
          cod_usu: user.profile.COD_USU,
          baseDatos: user.profile.baseDatos,
        });
        setPlazas(obtenerPlazas);

        const pagarAQuien = await GastosService.pagarA({
          cod_usu: user.profile.COD_USU,
          baseDatos: user.profile.baseDatos,
        });
        setPagarA(pagarAQuien);

        const tipoGastos = await TipoGastosService.getAll({});

        setTipoGastos(
          tipoGastos.map((tg) => ({ value: tg.Codigo, label: tg.Nombre }))
        );

        const combustibles = await CombustiblesService.getAll();

        setCombustibles(
          combustibles.map((obj) => ({ value: obj.Codigo, label: obj.Nombre }))
        );

        const cliVisibles = await ClientesService.clientesVisible({
          baseDatos: user.profile.baseDatos,
        });

        setClientesVisible(cliVisibles);
      } catch (error) {
        console.error("Error durante la carga inicial", error);
      }
    };

    cargaInicial();
  }, [user.profile.COD_USU, user.profile.baseDatos]);

  const handleCheckSucursal = () => {
    setIsCheckedSucursal(true);
    setIsCheckedIngeniero(false);
  };

  const handleCheckIngeniero = () => {
    setIsCheckedIngeniero(true);
    setIsCheckedSucursal(false);
  };

  const handleSelectPlaza = async (e) => {
    setPlazaSeleccionada(e.target.value);
    const inges = await IngenierosService.getAll({
      plaza: e.target.value,
      baseDatos: user.profile.baseDatos,
    });
    setIngenieros(inges);
  };

  return (
    <>
      <div className="row mb-3">
        <div className="col-sm-3">
          <div className="custom-control-inline">Gastos de:</div>
          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              className="custom-control-input"
              id="inlineRadioSucursal"
              name="gastosDe"
              checked={isCheckedSucursal}
              onChange={handleCheckSucursal}
            />
            <label
              className="custom-control-label"
              htmlFor="inlineRadioSucursal"
            >
              Sucursal
            </label>
          </div>

          <div className="custom-control custom-radio custom-control-inline">
            <input
              type="radio"
              className="custom-control-input"
              id="inlineRadioIngeniero"
              name="gastosDe"
              checked={isCheckedIngeniero}
              onChange={handleCheckIngeniero}
            />
            <label
              className="custom-control-label"
              htmlFor="inlineRadioIngeniero"
            >
              Ingeniero
            </label>
          </div>
        </div>

        {isCheckedIngeniero && (
          <div className="col-sm-3">
            <div className="input-group">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="selectIngeniero">
                  Ingeniero
                </label>
              </div>
              <select
                className="custom-select"
                id="selectIngeniero"
                value={selectedIngeniero}
                onChange={(e) => setSelectedIngeniero(e.target.value)}
              >
                <option value="">Seleccione...</option>
                {ingenieros.map((ingeniero) => (
                  <option key={ingeniero.Codigo} value={ingeniero.Codigo}>
                    {ingeniero.Nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="col-sm-2">
          <div className="input-group">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectFecha">
                Fecha:
              </label>
            </div>
            <input
              className="form-control"
              type="date"
              name="date"
              id="selectFecha"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
            />
          </div>
        </div>
        <div className="col-sm-4">
          <div className="input-group">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectPlaza">
                Plaza:
              </label>
            </div>
            <select
              className="custom-select"
              id="selectPlaza"
              value={plazaSeleccionada}
              onChange={handleSelectPlaza}
            >
              <option value="">Seleccione...</option>
              {plazas.map((plaza) => (
                <option key={plaza.Codigo} value={plaza.Codigo}>
                  {plaza.Nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-sm-3">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">Folio:</span>
            </div>
            <input
              type="text"
              id="inputFolio"
              className="form-control"
              placeholder="GC-002809"
              aria-label="Folio"
              aria-describedby="inputFolio"
              value={folio}
              onChange={(e) => setFolio(e.target.value)}
            />
            <div className="input-group-append">
              <button
                className="btn btn-outline-info waves-effect waves-themed"
                type="button"
              >
                <i className="fal fa-arrow-left"></i>
              </button>
              <button
                className="btn btn-outline-info waves-effect waves-themed"
                type="button"
              >
                <i className="fal fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="col-sm-5">
          <div className="input-group">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectPagarA">
                Pagar a:
              </label>
            </div>
            <select
              className="custom-select"
              id="selectPagarA"
              value={pagarASeleccionado}
              onChange={(e) => setPagarASeleccionado(e.target.value)}
            >
              <option value="">Seleccione...</option>
              {pagarA.map((p, index) => (
                <option key={`${p.Codigo}-${index}`} value={p.Codigo}>
                  {p.Nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <ModalPlaza
        plazas={plazas}
        plazaSeleccionada={plazaSeleccionada}
        handleSelectPlaza={handleSelectPlaza}
      />
    </>
  );
};
