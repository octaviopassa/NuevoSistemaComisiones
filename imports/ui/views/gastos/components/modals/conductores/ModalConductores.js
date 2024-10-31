import React, { useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { ConductorFormSchema } from "../../../schemas";
import Switch from "react-switch";
import { useUserSession } from "../../../../../store";
import toastr from "toastr";
import { ConductoresService, PlazasService } from "../../../../../services";
import Select from "react-select";
import { useFetchData } from "../../../../../hooks";

export const ModalConductores = ({
  isModalOpen,
  toggle,
  conductor,
  reloadData,
}) => {
  const { session } = useUserSession();
  const { data, isLoading: isLoadingPlazas } = useFetchData(
    PlazasService.getAll,
    [
      {
        cod_usu: session.profile.COD_USU,
        baseDatos: session.profile.baseDatos,
      },
    ]
  );

  const plazas = data.map((plaza) => ({
    value: plaza.Codigo,
    label: plaza.Nombre,
  }));

  const initialValues = {
    codigo: conductor ? conductor.Cod_Conductor : "#",
    nombre: conductor ? conductor.Nom_Conductor : "",
    estatus: conductor ? conductor.Nom_Estatus === "Activo" : true,
    plaza: conductor ? conductor.COD_PLAZA : "",
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      cod_usu: session.profile.COD_USU,
    };

    try {
      let result;
      if (conductor) {
        result = await ConductoresService.update(data, session.profile.baseDatos);
      } else {
        result = await ConductoresService.insert(data, session.profile.baseDatos);
      }

      if (!result.isValid) {
        toastr.error(result.message);
        return;
      }

      toastr.success(
        result.message ||
          `${conductor ? "Actualizado" : "Creado"} correctamente`
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
        validationSchema={ConductorFormSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, setFieldValue, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <ModalHeader className="bg-primary text-white" toggle={toggle}>
              {conductor ? "Editar Conductor" : "Agregar Conductor"}
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
                <label htmlFor="plaza">Plaza</label>
                <Select
                  name="plaza"
                  options={isLoadingPlazas ? [] : plazas}
                  onChange={(selectedOption) =>
                    setFieldValue("plaza", selectedOption.value)
                  }
                  value={plazas.find((plaza) => plaza.value === values.plaza)}
                  placeholder="Seleccione una plaza"
                />
                <ErrorMessage
                  name="plaza"
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
                  {conductor ? "Guardar Cambios" : "Agregar"}
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
