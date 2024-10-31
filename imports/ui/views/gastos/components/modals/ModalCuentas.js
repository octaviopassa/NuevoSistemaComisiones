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
import { CuentaFormSchema } from "../../schemas";
import Switch from "react-switch";
import toastr from "toastr";
import { CuentasService } from "../../../../services";
import Select from "react-select";
import { useFetchData } from "../../../../hooks";
import { useUserSession } from "../../../../store";

const tipoOptions = [
  { value: "TARJETA DE CREDITO", label: "Tarjeta de Crédito" },
  { value: "TARJETA DE DEBITO", label: "Tarjeta de Débito" },
  { value: "CUENTA BANCARIA", label: "Cuenta Bancaria" },
  { value: "CLABE INTERBANCARIA", label: "Clabe interbancaria" },
];

export const ModalCuentas = ({ isModalOpen, toggle, cuenta, reloadData }) => {
  const { session } = useUserSession();
  const { data, isLoading: isLoadingBancos } = useFetchData(
    CuentasService.getBancos,
    [session.profile.baseDatos]
  );

  const bancos = data?.map((banco) => ({
    value: banco.CODIGO,
    label: banco.NOMBRE,
  }));

  const initialValues = {
    codigo: cuenta ? cuenta.Codigo : "#",
    nombre: cuenta ? cuenta.NOMBRE_COMPLETO : "",
    apellidos: cuenta ? cuenta.APELLIDOS : "",
    num_tarjeta: cuenta ? cuenta.NUMERO : "",
    tipo: cuenta ? cuenta.TIPO : "",
    banco: cuenta ? cuenta.BANCO : "",
    rfc: cuenta ? cuenta.RFC : "",
    curp: cuenta ? cuenta.CURP : "",
    estatus: cuenta ? cuenta.ESTATUS === "A" : true,
  };

  const handleSubmit = async (values) => {
    const data = {
      ...values,
      cod_usu: session.profile.COD_USU,
    };
    try {
      let result;
      if (cuenta) {
        result = await CuentasService.update(data, session.profile.baseDatos);
      } else {
        result = await CuentasService.insert(data, session.profile.baseDatos);
      }

      if (!result.isValid) {
        toastr.error(result.message);
        return;
      }

      toastr.success(
        result.message || `${cuenta ? "Actualizado" : "Creado"} correctamente`
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
        validationSchema={CuentaFormSchema}
        onSubmit={handleSubmit}
      >
        {({ values, handleSubmit, setFieldValue, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <ModalHeader className="bg-primary text-white" toggle={toggle}>
              {cuenta ? "Editar Cuenta" : "Agregar Cuenta"}
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
                  autoComplete="given-name"
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
                <label className="form-label" htmlFor="apellidos">
                  Apellidos
                </label>
                <Field
                  autoComplete="family-name"
                  name="apellidos"
                  as={Input}
                  className="form-control"
                  invalid={!!values.apellidos && values.apellidos.length < 2}
                />
                <ErrorMessage
                  name="apellidos"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="num_tarjeta">
                  Número de Tarjeta
                </label>
                <Field
                  autoComplete="cc-number"
                  name="num_tarjeta"
                  as={Input}
                  className="form-control"
                  invalid={
                    !!values.num_tarjeta && values.num_tarjeta.length < 2
                  }
                />
                <ErrorMessage
                  name="num_tarjeta"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="tipo">
                  Tipo
                </label>
                <Select
                  name="tipo"
                  options={tipoOptions}
                  onChange={(selectedOption) =>
                    setFieldValue("tipo", selectedOption.value)
                  }
                  value={tipoOptions.find((tipo) => tipo.value === values.tipo)}
                  placeholder="Seleccione un tipo de tarjeta..."
                />
                <ErrorMessage
                  name="tipo"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="banco">
                  Banco
                </label>
                <Select
                  name="banco"
                  options={isLoadingBancos ? [] : bancos}
                  onChange={(selectedOption) =>
                    setFieldValue("banco", selectedOption.value)
                  }
                  value={bancos.find((banco) => banco.value === values.banco)}
                  placeholder="Seleccione un banco..."
                />
                <ErrorMessage
                  name="banco"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="rfc">
                  RFC
                </label>
                <Field
                  name="rfc"
                  as={Input}
                  className="form-control"
                  invalid={!!values.rfc && values.rfc.length < 2}
                />
                <ErrorMessage
                  name="rfc"
                  component="div"
                  className="text-danger"
                />
              </div>

              <div className="form-group mt-3">
                <label className="form-label" htmlFor="curp">
                  CURP
                </label>
                <Field
                  name="curp"
                  as={Input}
                  className="form-control"
                  invalid={!!values.curp && values.curp.length < 2}
                />
                <ErrorMessage
                  name="curp"
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
                  {cuenta ? "Guardar Cambios" : "Agregar"}
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
