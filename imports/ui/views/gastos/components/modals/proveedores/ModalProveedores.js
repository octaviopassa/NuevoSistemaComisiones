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
import { ProveedorFormSchema } from "../../../schemas";
import Switch from "react-switch";
import { ProveedoresService } from "../../../../../services";
import { useUserSession } from "../../../../../store";
import toastr from "toastr";

export const ModalProveedores = ({
  isModalOpen,
  toggle,
  proveedor,
  reloadData,
}) => {
  const { session } = useUserSession();

  const initialValues = {
    codigo: proveedor ? proveedor.codigo : "#",
    nombre: proveedor ? proveedor.nombre : "",
    rfc: proveedor ? proveedor.rfc : "",
    estatus: proveedor ? proveedor.estatus === "Activo" : true,
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      cod_usu: session.profile.COD_USU,
    };

    try {
      let result;
      if (proveedor) {
        result = await ProveedoresService.update(
          data,
          session.profile.baseDatos
        );
      } else {
        result = await ProveedoresService.insert(
          data,
          session.profile.baseDatos
        );
      }

      if (!result.isValid) {
        toastr.error(result.message);
        return;
      }

      toastr.success(
        result.message ||
          `${proveedor ? "Actualizado" : "Creado"} correctamente`
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
        validationSchema={ProveedorFormSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, setFieldValue, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <ModalHeader className="bg-primary text-white" toggle={toggle}>
              {proveedor ? "Editar Proveedor" : "Agregar Proveedor"}
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

              <div className="form-group mt-3">
                <label htmlFor="rfc">RFC</label>
                <Field
                  name="rfc"
                  as={Input}
                  className="form-control"
                  invalid={!!values.rfc && values.rfc.length < 10}
                />
                <ErrorMessage
                  name="rfc"
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
                  {proveedor ? "Guardar Cambios" : "Agregar"}
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
