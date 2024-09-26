import React, { useEffect, useState } from "react";
import {
  PlazasService,
  IngenierosService,
  GastosService,
  ClientesService,
} from "../../../../services";
import { ModalButton } from "../modals";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import { ModalCuentas } from "../modals/ModalCuentas";

export const GastosToolbar = ({ setClientesVisible }) => {
  const [plazas, setPlazas] = useState([]);
  const [pagarA, setPagarA] = useState([]);
  const [isCheckedSucursal, setIsCheckedSucursal] = useState(true);
  const [ingenieros, setIngenieros] = useState([]);
  const [reloadData, setReloadData] = useState(false);

  const { session: user } = useUserSession();
  const {
    plazaSeleccionada,
    setPlazaSeleccionada,
    pagarASeleccionado,
    setPagarASeleccionado,
    selectedIngeniero,
    setSelectedIngeniero,
    gastosDate,
    setGastosDate,
    folio,
    setFolio,
    estatus,
  } = useGastosData();

  useEffect(() => {
    cargaInicial();
  }, [user.profile.COD_USU, user.profile.baseDatos, reloadData]);

  useEffect(() => {
    if (plazaSeleccionada) getFolioIgenieros();
  }, [plazaSeleccionada]);

  const cargaInicial = async () => {
    try {
      const [obtenerPlazas, pagarAQuien, cliVisibles] = await Promise.all([
        PlazasService.getAll({
          cod_usu: user.profile.COD_USU,
          baseDatos: user.profile.baseDatos,
        }),
        GastosService.pagarA({
          cod_usu: user.profile.COD_USU,
          baseDatos: user.profile.baseDatos,
        }),
        ClientesService.clientesVisible({ baseDatos: user.profile.baseDatos }),
      ]);

      setPlazas(obtenerPlazas);
      setPagarA(pagarAQuien);
      setClientesVisible(cliVisibles);
    } catch (error) {
      console.error("Error durante la carga inicial", error);
    }
  };

  const getFolioIgenieros = async () => {
    try {
      if (!folio) {
        const [folioData, ingenierosData] = await Promise.all([
          GastosService.getFolioProvisional(plazaSeleccionada),
          IngenierosService.getAll({
            plaza: plazaSeleccionada,
            baseDatos: user.profile.baseDatos,
          }),
        ]);
        setFolio(folioData[0]?.Folio || "");
        setIngenieros(ingenierosData);

        return;
      }

      const ingenierosData = await IngenierosService.getAll({
        plaza: plazaSeleccionada,
        baseDatos: user.profile.baseDatos,
      });

      setIngenieros(ingenierosData);
    } catch (error) {
      console.error("Error en getFolioIgenieros", error);
    }
  };

  const handleChecks = async () => {
    setIsCheckedSucursal(!isCheckedSucursal);

    // Si cuando esta en sucursal esta en true entonces cuando este en sucursal quiero eliminar al selectedIngeniero
    if (isCheckedSucursal) {
      setSelectedIngeniero("");
    }
  };

  const handleSelectPlaza = async (e) => {
    setPlazaSeleccionada(e.target.value);
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
              onChange={handleChecks}
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
              checked={!isCheckedSucursal}
              onChange={handleChecks}
            />
            <label
              className="custom-control-label"
              htmlFor="inlineRadioIngeniero"
            >
              Ingeniero
            </label>
          </div>
        </div>

        {!isCheckedSucursal && (
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
              value={gastosDate}
              onChange={(e) => setGastosDate(e.target.value)}
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
              disabled
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
              disabled={estatus.estatus === "AUTORIZADO" || estatus.estatus === "CANCELADO"}
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
            <ModalButton
              color="primary"
              buttonClasses="px-3 ml-2"
              text="Agregar"
              ModalComponent={ModalCuentas}
              reloadData={() => setReloadData(!reloadData)}
            />
            {pagarASeleccionado && (
              <ModalButton
                color="secondary"
                buttonClasses="px-3 ml-2"
                text="Modificar Cuenta"
                ModalComponent={ModalCuentas}
                cuenta={pagarA.find(
                  (p) => p.Codigo === Number(pagarASeleccionado)
                )}
                reloadData={() => setReloadData(!reloadData)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
