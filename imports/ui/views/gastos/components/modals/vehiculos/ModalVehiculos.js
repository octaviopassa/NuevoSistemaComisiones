import React from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { VehiculoFormSchema } from "../../../schemas";
import Switch from "react-switch";
import toastr from "toastr";
import { ConductoresService, VehiculosService } from "../../../../../services";
import Select from "react-select";
import { useFetchData } from "../../../../../hooks";
import { useGastosData } from "../../../store";

export const ModalVehiculos = ({
  isModalOpen,
  toggle,
  vehiculo,
  reloadData,
}) => {
  const { plazaSeleccionada: plaza } = useGastosData();
  const { data, isLoading: isLoadingConductores } = useFetchData(
    ConductoresService.getAllByPlazaAndCode,
    [plaza]
  );

  const conductores = data.map((conductor) => ({
    value: conductor.CODIGO,
    label: conductor.NOMBRE,
  }));

  const initialValues = {
    codigo: vehiculo ? vehiculo.Cod_Vehiculo : "#",
    nombre: vehiculo ? vehiculo.Nom_Vehiculo : "",
    placa: vehiculo ? vehiculo.PLACA : "",
    modelo: vehiculo ? vehiculo.MODELO : "",
    numero_serie: vehiculo ? vehiculo.NUMERO_SERIE : "",
    numero_poliza: vehiculo ? vehiculo.POLIZA_SEGURO : "",
    conductor: vehiculo ? vehiculo.CODIGO_ENCARGADO : "",
    estatus: vehiculo ? vehiculo.Nom_Estatus === "Activo" : true,
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      plaza
    }
    try {
        let result;
        if (vehiculo) {
          result = await VehiculosService.update(data);
        } else {
          result = await VehiculosService.insert(data);
        }

        if (!result.isValid) {
          toastr.error(result.message);
          return;
        }

        toastr.success(
          result.message ||
            `${vehiculo ? "Actualizado" : "Creado"} correctamente`
        );
      toggle();
      reloadData();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal isOpen={isModalOpen} toggle={toggle}>
      <Formik
        initialValues={initialValues}
        validationSchema={VehiculoFormSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, setFieldValue, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <ModalHeader className="bg-primary text-white" toggle={toggle}>
              {vehiculo ? "Editar Vehículo" : "Agregar Vehículo"}
            </ModalHeader>
            <ModalBody>
              <div className="form-group">
                <label className="form-label" htmlFor="codigo">
                  Código
                </label>
                <Field
                  name="codigo"
                  as={Input}
                  className="form-control"
                  disabled
                />
              </div>
              <div className="form-group mt-3">
                <label className="form-label" htmlFor="nombre">
                  Nombre
                </label>
                <Field
                  name="nombre"
                  as={Input}
                  className="form-control"
                  invalid={!!values.nombre && values.nombre.length < 2}
                />
                <ErrorMessage
                  name="nombre"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="placa">
                  Placa
                </label>
                <Field
                  name="placa"
                  as={Input}
                  className="form-control"
                  invalid={!!values.placa && values.placa.length < 2}
                />
                <ErrorMessage
                  name="placa"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="modelo">
                  Modelo
                </label>
                <Field
                  name="modelo"
                  as={Input}
                  className="form-control"
                  invalid={!!values.modelo && values.modelo.length < 2}
                />
                <ErrorMessage
                  name="modelo"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="numero_serie">
                  Número de Serie
                </label>
                <Field
                  name="numero_serie"
                  as={Input}
                  className="form-control"
                  invalid={
                    !!values.numero_serie && values.numero_serie.length < 2
                  }
                />
                <ErrorMessage
                  name="numero_serie"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="numero_poliza">
                  Número de Poliza
                </label>
                <Field
                  name="numero_poliza"
                  as={Input}
                  className="form-control"
                  invalid={
                    !!values.numero_poliza && values.numero_poliza.length < 2
                  }
                />
                <ErrorMessage
                  name="numero_poliza"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="conductor">
                  Conductor
                </label>
                <Select
                  name="conductor"
                  options={isLoadingConductores ? [] : conductores}
                  onChange={(selectedOption) =>
                    setFieldValue("conductor", selectedOption.value)
                  }
                  value={conductores.find(
                    (conductor) => conductor.value === values.conductor
                  )}
                  placeholder="Seleccione un conductor"
                />
                <ErrorMessage
                  name="conductor"
                  component="div"
                  className="text-danger"
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <div className="d-flex align-items-center ml-1">
                <Switch
                  id="estatus"
                  name="estatus"
                  checked={values.estatus}
                  onChange={(checked) => setFieldValue("estatus", checked)}
                  onColor="#886AB5"
                  uncheckedIcon={false}
                  checkedIcon={false}
                  height={19}
                  width={35}
                  handleDiameter={15}
                />
              </div>

              <div className="ml-auto">
                <Button disabled={isSubmitting} color="primary" type="submit">
                  {vehiculo ? "Guardar Cambios" : "Agregar"}
                  {isSubmitting && (
                    <span className="spinner-border spinner-border-sm ml-2"></span>
                  )}
                </Button>
                <Button className="ml-2" color="secondary" onClick={toggle}>
                  Cancelar
                </Button>
              </div>
            </ModalFooter>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};
