import React, { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import toastr from "toastr";
import Select from "react-select/async";
import {
  VehiculosService,
  GasolinerasService,
  ConductoresService,
} from "../../../../services";
import { ModalButton } from "./ModalButton";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { ModalCatalogoConductores } from "./conductores";

export const ModalCombustible = ({
  plazaSeleccionada,
  modalCombustibleVisible,
  toggleModalCombustible,
  combustibles,
  setDocumentos,
}) => {
  const [gasolineras, setGasolineras] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductorSeleccionado, setConductorSeleccionado] = useState(null);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [kilometraje, setKilometraje] = useState("");
  const [litros, setLitros] = useState("");
  const [combustibleSeleccionado, setCombustibleSeleccionado] = useState(null);
  const [gasolineraSeleccionada, setGasolineraSeleccionada] = useState(null);

  useEffect(() => {
    const cargaInicial = async () => {
      if (plazaSeleccionada != "") {
        const vehiculos = await VehiculosService.getAll({
          plaza: plazaSeleccionada,
        });
        setVehiculos(
          vehiculos.map((obj) => ({
            value: obj.Cod_Vehiculo,
            label: obj.Nom_Vehiculo,
          }))
        );

        const gasolineras = await GasolinerasService.getAll({
          plaza: plazaSeleccionada,
        });

        setGasolineras(
          gasolineras.map((obj) => ({
            value: obj.Cod_Gasolinera,
            label: obj.Nom_Gasolinera,
          }))
        );

        const conductores = await ConductoresService.getAll(plazaSeleccionada);
        setConductores(
          conductores.map((obj) => ({
            value: obj.Cod_Conductor,
            label: obj.Nom_Conductor,
          }))
        );
      }
    };
    cargaInicial();

    return () => {
      setGasolineras([]);
      setConductores([]);
      setVehiculos([]);
    };
  }, [plazaSeleccionada]);

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
    const datosCombustible = {
      conductor: conductorSeleccionado,
      vehiculo: vehiculoSeleccionado,
      kilometraje,
      litros,
      combustible: combustibleSeleccionado,
      gasolinera: gasolineraSeleccionada,
    };

    // Actualizar el documento actual con los datos de combustible
    setDocumentos((prevDocumentos) =>
      prevDocumentos.map((doc, index) => {
        if (index === prevDocumentos.length - 1) {
          // Asumimos que queremos agregar los datos al último documento
          return {
            ...doc,
            datosCombustible: datosCombustible,
          };
        }
        return doc;
      })
    );

    // Limpiar los campos del modal de combustible
    setConductorSeleccionado(null);
    setVehiculoSeleccionado(null);
    setKilometraje("");
    setLitros("");
    setCombustibleSeleccionado(null);
    setGasolineraSeleccionada(null);

    toggleModalCombustible();
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
    <Modal isOpen={modalCombustibleVisible} toggle={toggleModalCombustible}>
      <ModalHeader toggle={toggleModalCombustible}>
        Gasto de combustible
      </ModalHeader>
      <ModalBody>
        <div className="form-group">
          <label>
            Conductor
            <ModalButton
              icon={faGear}
              ModalComponent={ModalCatalogoConductores}
            />
          </label>
          <Select
            id="conductor"
            cacheOptions
            loadOptions={filterConductor}
            defaultOptions={conductores}
            onChange={handleConductorChange}
            placeholder="Seleccione el conductor"
          />
        </div>
        <div className="form-group">
          <label>Vehículo</label>
          <Select
            id="vehiculo"
            cacheOptions
            loadOptions={filterVehiculo}
            defaultOptions={vehiculos}
            onChange={handleVehiculoChange}
            placeholder="Seleccione el vehículo"
          />
        </div>
        <div className="form-group">
          <label>Kilometraje</label>
          <input
            type="number"
            className="form-control"
            value={kilometraje}
            onChange={handleKilometrajeChange}
          />
        </div>
        <div className="form-group">
          <label>Litros</label>
          <input
            type="number"
            className="form-control"
            value={litros}
            onChange={handleLitrosChange}
          />
        </div>
        <div className="form-group">
          <label>Combustible</label>
          <Select
            id="combustible"
            cacheOptions
            loadOptions={filterCombustible}
            defaultOptions={combustibles}
            onChange={handleCombustibleChange}
            placeholder="Seleccione el combustible"
          />
        </div>
        <div className="form-group">
          <label>Gasolinera</label>
          <Select
            id="gasolinera"
            cacheOptions
            loadOptions={filterGasolinera}
            defaultOptions={gasolineras}
            onChange={handleGasolineraChange}
            placeholder="Seleccione la gasolinera"
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggleModalCombustible}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleGuardarCombustible}>
          Guardar
        </Button>
      </ModalFooter>
    </Modal>
  );
};
