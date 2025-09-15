import React, { useEffect, useState } from "react";
import { PlazasService, GastosService } from "../../../../services";
import { ModalButton } from "../modals";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import { ModalCuentas } from "../modals/ModalCuentas";
import { GastosFolioInput } from "./GastosFolioInput";
import { useSearchParams } from "react-router-dom";
import { ModalRepresentantes } from "../modals/ModalRepresentantes";
import { RepresentantesService } from "../../../../services/representantes";
// import { getAniosComisiones, getMesesComisiones } from "../../../../../utils/utils";

export const GastosToolbar = () => {
  const [plazas, setPlazas] = useState([]);
  const [pagarA, setPagarA] = useState([]);
  const [representantes, setRepresentantes] = useState([]);
  // const [proyectos, setProyectos] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  // const history = useLocation()?.state;
  const [searchParams] = useSearchParams();
  const folioParam = searchParams.get('folio');
  const plazaParam = searchParams.get('plaza');
  const [empresasResponsablesPago, setEmpresasResponsablesPago] = useState([]);
  // const [meses, setMeses] = useState({});
  // const [anios, setAnios] = useState([]);
  const { session } = useUserSession();
  const { session: user } = useUserSession();
  const {
    plazaSeleccionada,
    setPlazaSeleccionada,
    // proyectoSeleccionado,
    // setProyectoSeleccionado,
    pagarASeleccionado,
    setPagarASeleccionado,
    selectedRepresentante,
    setSelectedRepresentante,
    gastosDate,
    setGastosDate,
    folio,
    setFolio,
    estatus,
    isCheckedSucursal,
    // toggleCheckedSucursal,
    rfcEmpresaResponsablePagoSeleccionada,
    setRfcEmpresaResponsablePagoSeleccionada,
    // mesComision,
    // setMesComision,
    // anioComision,
    // setAnioComision,
    fecha1,
    fecha2,
    setFecha1,
    setFecha2,
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

  // useEffect(() => {
  //   if (plazaSeleccionada) getRepresentantes();
  //   else {
  //     setRepresentantes([]);
  //   }
  // }, [folio]);

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

      const representantesPromise = RepresentantesService.getAll({
        plaza: estatus.estatus === "Nuevo" ? plazaSeleccionada : "#",
        servidor: user.profile.servidor,
      });

      // const proyectosPromise = user.profile.MOSTRAR_COMBO_PROYECTO
      //   ? GastosService.getProyectos(user.profile.servidor)
      //   : null;

      const empresasResponsablesPagoPromise = GastosService.getEmpresasResponsablesPago()

      const [obtenerPlazas, pagarAQuien, /* proyectosResponse, */ empresasResponsablesPagoResponse, representantesResponse] = await Promise.all(
        [plazasPromise, pagarAPromise, /* proyectosPromise, */ empresasResponsablesPagoPromise, representantesPromise]
      );

      // if (proyectosResponse) {
      //   setProyectos(proyectosResponse.data);
      // }

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
      setRepresentantes(representantesResponse);

      // const meses = getMesesComisiones();
      // setMeses(meses);

      // const anios = getAniosComisiones();
      // setAnios(anios);

    } catch (error) {
      console.error("Error durante la carga inicial", error);
    }
  };

  // const getRepresentantes = async () => {
  //   try {
  //     const representantesData = await RepresentantesService.getAll({
  //       plaza: plazaSeleccionada,
  //       servidor: user.profile.servidor,
  //     });

  //     setRepresentantes(representantesData);
  //   } catch (error) {
  //     console.error("Error en getRepresentantes", error);
  //   }
  // };

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

  // const handleChecks = async () => {
  //   toggleCheckedSucursal();
  //   if (isCheckedSucursal) {
  //     setSelectedRepresentante("");
  //   }
  // };

  return (
    <>
      <div className="row mb-3">
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

          {!isCheckedSucursal && (
            <div className="input-group">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="selectRepresentante">
                  Representante
                </label>
              </div>
              <select
                className="custom-select"
                id="selectRepresentante"
                value={selectedRepresentante}
                onChange={(e) => setSelectedRepresentante(e.target.value)}
                disabled={estatus.estatus !== "Nuevo"}
              >
                <option value="">Seleccione...</option>
                {representantes?.map((representante) => (
                  <option key={representante.CODIGO_REPRESENTANTE} value={representante.CODIGO_REPRESENTANTE}>
                    {representante.NOMBRE_REPRESENTANTE}
                  </option>
                ))}
              </select>
              {session.profile.CAT_REPRESENTANTES && (
                <>
                  <ModalButton
                    color="primary"
                    buttonClasses="px-3 ml-2"
                    text="Agregar"
                    ModalComponent={ModalRepresentantes}
                    reloadData={() => setReloadData(!reloadData)}
                  />
                  {selectedRepresentante && (
                    <ModalButton
                      color="secondary"
                      buttonClasses="px-3 ml-2"
                      text="Editar"
                      ModalComponent={ModalRepresentantes}
                      representante={representantes.find(
                        (p) => p.CODIGO_REPRESENTANTE === Number(selectedRepresentante)
                      )}
                      reloadData={() => setReloadData(!reloadData)}
                    />
                  )}
                </>
              )}
            </div>
          )}

          <GastosFolioInput />
        </div>
        {/* <div className="col-sm-3">
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
              id="inlineRadiorRepresentante"
              name="gastosDe"
              checked={!isCheckedSucursal}
              onChange={handleChecks}
              disabled={estatus.estatus !== "Nuevo"}
            />
            <label
              className="custom-control-label"
              htmlFor="inlineRadioRepresentante"
            >
              Representante
            </label>
          </div>
        </div> */}

        {/* {!isCheckedSucursal && (
          <div className="col-sm-3">
            <div className="input-group">
              <div className="input-group-prepend">
                <label className="input-group-text" htmlFor="selectRepresentante">
                  Representante
                </label>
              </div>
              <select
                className="custom-select"
                id="selectRepresentante"
                value={selectedRepresentante}
                onChange={(e) => setSelectedRepresentante(e.target.value)}
                disabled={estatus.estatus !== "Nuevo"}
              >
                <option value="">Seleccione...</option>
                {representantes.map((representante) => (
                  <option key={representante.CODIGO_REPRESENTANTE} value={representante.CODIGO_REPRESENTANTE}>
                    {representante.NOMBRE_REPRESENTANTE}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )} */}

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

          <div className="input-group">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectFecha1">
                Desde:
              </label>
            </div>
            <input
              className="form-control"
              type="date"
              name="date"
              id="selectFecha1"
              disabled={estatus.estatus === "APLICADO" || estatus.estatus === "CANCELADO" || estatus.estatus === "AUTORIZADO"}
              value={fecha1}
              onChange={(e) => setFecha1(e.target.value)}
            />
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectFecha2">
                Hasta:
              </label>
            </div>
            <input
              className="form-control"
              type="date"
              name="date"
              id="selectFecha2"
              disabled={estatus.estatus === "APLICADO" || estatus.estatus === "CANCELADO" || estatus.estatus === "AUTORIZADO"}
              value={fecha2}
              onChange={(e) => setFecha2(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* <div className="row mb-3">
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
          <div className="input-group">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectMesComision">
                Mes:
              </label>
            </div>
            <select
              className="custom-select"
              id="selectMesComision"
              disabled={estatus.estatus !== "Nuevo"}
              onChange={(e) => setMesComision(e.target.value)}
              value={mesComision}
            >
              <option value="">Seleccione el mes</option>
              {Object.entries(meses || {})?.map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectAnioComision">
                Año:
              </label>
            </div>
            <select
              className="custom-select"
              id="selectAnioComision"
              disabled={estatus.estatus !== "Nuevo"}
              onChange={(e) => setAnioComision(e.target.value)}
              value={anioComision}
            >
              <option value="">Seleccione el año</option>
              {anios?.map((anio) => (
                <option key={anio} value={anio}>
                  {anio}
                </option>
              ))}
            </select>
          </div>
          <div className="input-group">
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectFecha1">
                Desde:
              </label>
            </div>
            <input
              className="form-control"
              type="date"
              name="date"
              id="selectFecha1"
              disabled={estatus.estatus === "APLICADO" || estatus.estatus === "CANCELADO" || estatus.estatus === "AUTORIZADO"}
              value={fecha1}
              onChange={(e) => setFecha1(e.target.value)}
            />
            <div className="input-group-prepend">
              <label className="input-group-text" htmlFor="selectFecha2">
                Hasta:
              </label>
            </div>
            <input
              className="form-control"
              type="date"
              name="date"
              id="selectFecha2"
              disabled={estatus.estatus === "APLICADO" || estatus.estatus === "CANCELADO" || estatus.estatus === "AUTORIZADO"}
              value={fecha2}
              onChange={(e) => setFecha2(e.target.value)}
            />
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
      </div> */}
    </>
  );
};
