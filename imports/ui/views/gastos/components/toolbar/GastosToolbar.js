import React, { useEffect, useState } from "react";
import {
  PlazasService,
  IngenierosService,
  GastosService,
} from "../../../../services";
import { ModalButton } from "../modals";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import { ModalCuentas } from "../modals/ModalCuentas";
import { GastosFolioInput } from "./GastosFolioInput";
import { useSearchParams } from "react-router-dom";

export const GastosToolbar = () => {
  const [plazas, setPlazas] = useState([]);
  const [pagarA, setPagarA] = useState([]);
  const [ingenieros, setIngenieros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  // const history = useLocation()?.state;
  const [searchParams] = useSearchParams();
  const folioParam = searchParams.get('folio');
  const plazaParam = searchParams.get('plaza');
  const [empresasResponsablesPago, setEmpresasResponsablesPago] = useState([]);

  const { session: user } = useUserSession();
  const {
    plazaSeleccionada,
    setPlazaSeleccionada,
    proyectoSeleccionado,
    setProyectoSeleccionado,
    pagarASeleccionado,
    setPagarASeleccionado,
    selectedIngeniero,
    setSelectedIngeniero,
    gastosDate,
    setGastosDate,
    folio,
    setFolio,
    estatus,
    isCheckedSucursal,
    toggleCheckedSucursal,
    rfcEmpresaResponsablePagoSeleccionada,
    setRfcEmpresaResponsablePagoSeleccionada,
  } = useGastosData();

  useEffect(() => {
    cargaInicial();
  }, [user.profile.COD_USU, user.profile.baseDatos, reloadData, folio]);

  // useEffect(() => {
  //   getFolio();
  // }, [plazaSeleccionada]);

  useEffect(() => {
    if (!folioParam) {  // Solo obtener folio si no viene de navegación
      getFolio();
    }
  }, [plazaSeleccionada]);

  useEffect(() => {
    if (plazaSeleccionada) getIngenieros();
  }, [folio]);

  const cargaInicial = async () => {
    try {
      const isConsulta = (folioParam && plazaParam) || estatus.oldFolio;

      const plazasPromise = PlazasService.getAll({
        cod_usu: user.profile.COD_USU,
        baseDatos: user.profile.baseDatos,
        servidor: user.profile.servidor,
      });

      const pagarAPromise = GastosService.pagarA({
        cod_usu: estatus.propietario || !isConsulta ? user.profile.COD_USU : "",
        baseDatos: user.profile.baseDatos,
        servidor: user.profile.servidor,
      });

      const proyectosPromise = user.profile.MOSTRAR_COMBO_PROYECTO
        ? GastosService.getProyectos(user.profile.servidor)
        : null;

      const empresasResponsablesPagoPromise = GastosService.getEmpresasResponsablesPago()

      const [obtenerPlazas, pagarAQuien, proyectosResponse, empresasResponsablesPagoResponse] = await Promise.all(
        [plazasPromise, pagarAPromise, proyectosPromise, empresasResponsablesPagoPromise]
      );

      if (proyectosResponse) {
        setProyectos(proyectosResponse.data);
      }

      setEmpresasResponsablesPago(empresasResponsablesPagoResponse.data);

      setPlazas(
        obtenerPlazas?.map((plaza) => ({
          Codigo: plaza.CODIGO,
          Nombre: plaza.NOMBRE,
        }))
      );

      if (obtenerPlazas.length === 1) {
        setPlazaSeleccionada(obtenerPlazas[0].CODIGO);
      }

      setPagarA(pagarAQuien);
    } catch (error) {
      console.error("Error durante la carga inicial", error);
    }
  };

  const getIngenieros = async () => {
    try {
      const ingenierosData = await IngenierosService.getAll({
        plaza: plazaSeleccionada,
        baseDatos: user.profile.baseDatos,
        servidor: user.profile.servidor,
      });

      setIngenieros(ingenierosData);
    } catch (error) {
      console.error("Error en getIngenieros", error);
    }
  };

  const getFolio = async () => {
    try {
      const data = await GastosService.getFolioProvisional({
        plaza: plazaSeleccionada,
        servidor: user.profile.servidor,
      });
      setFolio(data?.[0]?.Folio || "");
    } catch (error) {
      console.error("Error en getFolioProvisional", error);
    }
  };

  const handleChecks = async () => {
    toggleCheckedSucursal();
    if (isCheckedSucursal) {
      setSelectedIngeniero("");
    }
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
              disabled={estatus.estatus !== "Nuevo"}
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
              disabled={estatus.estatus !== "Nuevo"}
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
                disabled={estatus.estatus !== "Nuevo"}
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
              disabled={estatus.estatus !== "Nuevo"}
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
              disabled={estatus.estatus !== "Nuevo"}
              onChange={(e) => setPlazaSeleccionada(e.target.value)}
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
        <GastosFolioInput />

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
              disabled={
                (estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO") ||
                !estatus.propietario
              }
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
          <div className="input-group">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectEmpresaPago">
                Empresa Pago:
              </label>
            </div>
            <select
              className="custom-select"
              id="selectEmpresaPago"
              disabled={estatus.estatus !== "Nuevo"}
              onChange={(e) => setRfcEmpresaResponsablePagoSeleccionada(e.target.value)}
              value={rfcEmpresaResponsablePagoSeleccionada}
            >
              <option value="">Seleccione la empresa</option>
              {empresasResponsablesPago?.map((empresa) => (
                <option key={empresa.RFC} value={empresa.RFC}>
                  {empresa.NOMBRE}
                </option>
              ))}
            </select>
          </div>
          {user.profile.MOSTRAR_COMBO_PROYECTO ? (
            <div className="input-group">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="selectCuenta">
                  Proyecto:
                </label>
              </div>
              <select
                className="custom-select"
                id="selectCuenta"
                disabled={
                  estatus.estatus !== "Nuevo" && estatus.estatus !== "GRABADO"
                }
                onChange={(e) => setProyectoSeleccionado(e.target.value)}
                value={proyectoSeleccionado}
              >
                <option value="">Seleccione un proyecto</option>
                {proyectos?.map((proyecto) => (
                  <option key={proyecto.CODIGO} value={proyecto.CODIGO}>
                    {proyecto.NOMBRE}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};
