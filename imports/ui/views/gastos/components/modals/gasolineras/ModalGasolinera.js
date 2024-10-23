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
import { GasolineraFormSchema } from "../../../schemas";
import Switch from "react-switch";
import toastr from "toastr";
import { useGastosData } from "../../../store";
import { GasolinerasService } from "../../../../../services";

export const ModalGasolinera = ({
  isModalOpen,
  toggle,
  gasolinera,
  reloadData,
}) => {
  const { plazaSeleccionada: plaza } = useGastosData();

  const initialValues = {
    codigo: gasolinera ? gasolinera.Cod_Gasolinera : "#",
    nombre: gasolinera ? gasolinera.Nom_Gasolinera : "",
    estatus: gasolinera ? gasolinera.Nom_Estatus === "Activo" : true,
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      plaza,
    };

    try {
      let result;
      if (gasolinera) {
        result = await GasolinerasService.update(data);
      } else {
        result = await GasolinerasService.insert(data);
      }

      if (!result.isValid) {
        toastr.error(result.message);
        return;
      }

      toastr.success(
        result.message ||
          `${gasolinera ? "Actualizado" : "Creado"} correctamente`
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
        validationSchema={GasolineraFormSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, setFieldValue, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <ModalHeader className="bg-primary text-white" toggle={toggle}>
              {gasolinera ? "Editar Gasolinera" : "Agregar Gasolinera"}
            </ModalHeader>
            <ModalBody>
              <div className="form-group">
                <label htmlFor="nombre">Código</label>
                <Field
                  name="codigo"
                  as={Input}
                  className="form-control"
                  disabled
                />
              </div>
              <div className="form-group mt-3">
                <label htmlFor="nombre">Nombre</label>
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
                  {gasolinera ? "Guardar Cambios" : "Agregar"}
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
