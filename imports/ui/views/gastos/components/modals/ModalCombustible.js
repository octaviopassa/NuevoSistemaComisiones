import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import toastr from "toastr";
import AsyncSelect from "react-select/async";
import {
  VehiculosService,
  GasolinerasService,
  ConductoresService,
  CombustibleService,
} from "../../../../services";
import { ModalButton } from "./ModalButton";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { ModalCatalogoConductores } from "./conductores";
import { ModalCatalogoVehiculos } from "./vehiculos";
import { useGastosData } from "../../store";
import { ModalCatalogoGasolineras } from "./gasolineras/ModalCatalogoGasolineras";
import { useUserSession } from "../../../../store";

export const ModalCombustible = ({
  isModalOpen,
  toggle,
  setDetalleGasto,
  detalleGasto,
}) => {
  const [gasolineras, setGasolineras] = useState([]);
  const [combustibles, setCombustibles] = useState("");
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductorSeleccionado, setConductorSeleccionado] = useState(
    detalleGasto.conductor || null
  );
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(
    detalleGasto.vehiculo || null
  );
  const [kilometraje, setKilometraje] = useState(
    detalleGasto.kilometraje || ""
  );
  const [litros, setLitros] = useState(detalleGasto.litros || "");
  const [combustibleSeleccionado, setCombustibleSeleccionado] = useState(
    detalleGasto.combustible || null
  );
  const [gasolineraSeleccionada, setGasolineraSeleccionada] = useState(
    detalleGasto.gasolinera || null
  );

  const { plazaSeleccionada } = useGastosData();
  const { session } = useUserSession();

  useEffect(() => {
    cargaInicial();

    return () => {
      setGasolineras([]);
      setConductores([]);
      setVehiculos([]);
    };
  }, []); //[plazaSeleccionada]

  const cargaInicial = async () => {
    if (plazaSeleccionada != "") {
      const gasolineras = await GasolinerasService.getAll({
        plaza: plazaSeleccionada,
        baseDatos: session.profile.baseDatos,
        servidor: session.profile.servidor,
      });

      const vehiculos = await VehiculosService.getAll({
        plaza: plazaSeleccionada,
        baseDatos: session.profile.baseDatos,
        servidor: session.profile.servidor,
      });
      const conductores = await ConductoresService.getAll({
        plaza: plazaSeleccionada,
        baseDatos: session.profile.baseDatos,
        servidor: session.profile.servidor,
      });
      const combustibles = await CombustibleService.getAll({
        servidor: session.profile.servidor,
      });

      setVehiculos(
        vehiculos.map((obj) => ({
          value: obj.Cod_Vehiculo,
          label: obj.Nom_Vehiculo_Placa,
        }))
      );
      
      setGasolineras(
        gasolineras.map((obj) => ({
          value: obj.Cod_Gasolinera,
          label: obj.Nom_Gasolinera,
        }))
      );

      setConductores(
        conductores.map((obj) => ({
          value: obj.Cod_Conductor,
          label: obj.Nom_Conductor,
        }))
      );

      setCombustibles(
        combustibles.map((obj) => ({ value: obj.Codigo, label: obj.Nombre }))
      );
    }
  };

  const handleConductorChange = (selectedOption) => {
    setConductorSeleccionado(selectedOption);
  };

  const handleVehiculoChange = (selectedOption) => {
    setVehiculoSeleccionado(selectedOption);
  };

  const handleKilometrajeChange = (e) => {
    setKilometraje(e.target.value);
  };

  const handleLitrosChange = (e) => {
    setLitros(e.target.value);
  };

  const handleCombustibleChange = (selectedOption) => {
    setCombustibleSeleccionado(selectedOption);
  };

  const handleGasolineraChange = (selectedOption) => {
    setGasolineraSeleccionada(selectedOption);
  };

  const handleGuardarCombustible = () => {
    if (
      !conductorSeleccionado ||
      !vehiculoSeleccionado ||
      !kilometraje ||
      !litros ||
      !combustibleSeleccionado ||
      !gasolineraSeleccionada
    ) {
      toastr.error("Todos los campos son obligatorios");
      return;
    }
    const datosCombustible = {
      conductor: conductorSeleccionado,
      vehiculo: vehiculoSeleccionado,
      kilometraje,
      litros,
      combustible: combustibleSeleccionado,
      gasolinera: gasolineraSeleccionada,
    };

    // Actualizar el documento actual con los datos de combustible
    setDetalleGasto(datosCombustible);

    // Limpiar los campos del modal de combustible
    setConductorSeleccionado(null);
    setVehiculoSeleccionado(null);
    setKilometraje("");
    setLitros("");
    setCombustibleSeleccionado(null);
    setGasolineraSeleccionada(null);

    toggle();
    toastr.success("Datos de combustible agregados al documento");
  };

  const filterConductor = (inputValue) => {
    return new Promise((resolve) => {
      resolve(
        conductores.filter((conductor) =>
          conductor.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    });
  };

  const filterVehiculo = (inputValue) => {
    return new Promise((resolve) => {
      resolve(
        vehiculos.filter((vehiculo) =>
          vehiculo.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    });
  };

  const filterCombustible = (inputValue) => {
    return new Promise((resolve) => {
      resolve(
        combustibles.filter((combustible) =>
          combustible.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    });
  };

  const filterGasolinera = (inputValue) => {
    return new Promise((resolve) => {
      resolve(
        gasolineras.filter((obj) =>
          obj.label.toLowerCase().includes(inputValue.toLowerCase())
        )
      );
    });
  };

  return (
    <Modal isOpen={isModalOpen} toggle={toggle}>
      <ModalHeader className="bg-primary text-white" toggle={toggle}>
        Gasto de combustible
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label className="form-label d-flex align-items-center">
            Conductor
            <ModalButton
              icon={faGear}
              ModalComponent={ModalCatalogoConductores}
              reloadDataCombustible={cargaInicial}
              plaza={plazaSeleccionada}
            />
          </label>
          <AsyncSelect
            id="conductor"
            cacheOptions
            loadOptions={filterConductor}
            defaultOptions={conductores}
            onChange={handleConductorChange}
            placeholder="Seleccione el conductor"
            value={conductorSeleccionado}
          />
        </div>
        <div className="form-group">
          <label className="form-label d-flex align-items-center">
            Vehículo
            <ModalButton
              icon={faGear}
              ModalComponent={ModalCatalogoVehiculos}
              reloadDataCombustible={cargaInicial}
            />
          </label>
          <AsyncSelect
            id="vehiculo"
            cacheOptions
            loadOptions={filterVehiculo}
            defaultOptions={vehiculos}
            onChange={handleVehiculoChange}
            placeholder="Seleccione el vehículo"
            value={vehiculoSeleccionado}
          />
        </div>
        <div className="form-group">
          <label className="form-label d-flex align-items-center">
            Kilometraje
          </label>
          <input
            type="number"
            className="form-control"
            value={kilometraje}
            onChange={handleKilometrajeChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label d-flex align-items-center">Litros</label>
          <input
            type="number"
            className="form-control"
            value={litros}
            onChange={handleLitrosChange}
          />
        </div>
        <div className="form-group">
          <label className="form-label d-flex align-items-center">
            Combustible
          </label>
          <AsyncSelect
            id="combustible"
            cacheOptions
            loadOptions={filterCombustible}
            defaultOptions={combustibles}
            onChange={handleCombustibleChange}
            value={combustibleSeleccionado}
            placeholder="Seleccione el combustible"
          />
        </div>
        <div className="form-group">
          <label className="form-label d-flex align-items-center">
            Gasolinera
            <ModalButton
              icon={faGear}
              ModalComponent={ModalCatalogoGasolineras}
              reloadDataCombustible={cargaInicial}
            />
          </label>
          <AsyncSelect
            id="gasolinera"
            cacheOptions
            loadOptions={filterGasolinera}
            defaultOptions={gasolineras}
            onChange={handleGasolineraChange}
            placeholder="Seleccione la gasolinera"
            value={gasolineraSeleccionada}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleGuardarCombustible}>
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
