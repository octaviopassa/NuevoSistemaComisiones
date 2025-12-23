import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Row,
  Col,
  Table,
} from "reactstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import Select from "react-select";
import Switch from "react-switch";
import toastr from "toastr";
import AsyncSelect from "react-select/async";
import { useFetchData } from "../../../../hooks";
import { useUserSession } from "../../../../store";
import { ClientesService, RepresentantesService } from "../../../../services";
import { ZonasService } from "../../../../services/zonas";
import { RepresentantesFormSchema } from "../../schemas/RepresentantesSchema";
import { UncontrolledTooltip } from "reactstrap";

export const ModalRepresentantes = ({
  isModalOpen,
  toggle,
  representante,
  reloadData,
}) => {
  const { session } = useUserSession();
  const [clienteSeleccionado, setClienteSeleccionado] = useState("");
  const [recargarClientesRelacionados, setRecargarClientesRelacionados] = useState(false);
  const [clientesRelacionados, setClientesRelacionados] = useState([]);

  const { data: zonasData, isLoading: isLoadingZonas } = useFetchData(
    ZonasService.getAll,
    [
      {
        baseDatos: session?.profile?.baseDatos,
        servidor: session?.profile?.servidor,
      },
    ]
  );

  const zonas = useMemo(
    () =>
      (zonasData || []).map((z) => ({
        value: z.COD_ZONA,
        label: z.NOM_ZONA,
      })),
    [zonasData]
  );

  const clientesOptions = async (inputValue) => {
    if (inputValue.length >= 3) {
      try {
        const clientes = await ClientesService.getAllByName({
          search: inputValue,
          codigoRepresentante: 0,
          servidor: session.profile.servidor,
        });

        return clientes.map((p) => ({
          value: p.Codigo,
          label: p.Nombre,
        }));
      } catch (error) {
        console.error("Error al cargar clientes", error);
        return [];
      }
    }
    return [];
  };

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: 200,
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  useEffect(() => {
    if (representante) {
      consultarClientesRelacionados();
    }
  }, [recargarClientesRelacionados]);

  const consultarClientesRelacionados = async () => {
    try {
      const dataClientesRelacionadosPromise = RepresentantesService.getClientesRelacionados({
        baseDatos: session?.profile?.baseDatos,
        servidor: session?.profile?.servidor,
        codigoRepresentante: representante?.CODIGO_REPRESENTANTE || 0,
      });

      const dataClientesRelacionados = await dataClientesRelacionadosPromise;
      setClientesRelacionados(
        dataClientesRelacionados.map((c) => ({
          value: c.COD_CTE,
          label: c.NOM_CTE,
        }))
      );
    }
    catch (error) {
      console.log(error);
    }
  }

  const initialValues = {
    codigo_representante: representante?.CODIGO_REPRESENTANTE ?? "#",
    nombre_representante: representante?.NOMBRE_REPRESENTANTE ?? "",
    porcentaje_comision: representante?.PTJE_COMISION ?? 0,
    cod_zona: representante?.COD_ZONA ?? "",
    observaciones: representante?.OBSERVACIONES ?? "",
    estatus: representante ? representante.ESTATUS === "A" : true,
    detalles: [], // <- lista que alimenta la tabla derecha    
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      accion: representante ? "ACTUALIZAR" : "INSERTAR",
      ...values,
      cod_usu: session?.profile?.COD_USU,
      servidor: session?.profile?.servidor,
    };

    try {
      const result = await RepresentantesService.grabar(payload);

      if (!result?.isValid) {
        toastr.error(result?.message || "Operación no válida");
        setSubmitting(false);
        return;
      }

      toastr.success(result?.message || (representante ? "Actualizado correctamente" : "Creado correctamente"));
      toggle();
      reloadData?.();
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGrabarClienteRelacionado = async () => {
    try {
      if (!clienteSeleccionado) {
        toastr.info("Seleccione un cliente");
        return;
      }

      const existe = clientesRelacionados.some((d) => String(d.value) === String(clienteSeleccionado.value));
      if (existe) {
        toastr.info("Ya existe en la lista");
        return;
      }

      const result = await RepresentantesService.grabarClienteRelacionado({
        codigoRepresentante: representante?.CODIGO_REPRESENTANTE || 0,
        codigoCliente: clienteSeleccionado.value,
        servidor: session.profile.servidor,
      });

      if (!result?.isValid) {
        toastr.error(result?.message || "Operación no válida");
        return;
      }

      toastr.success(result?.message || "Cliente relacionado correctamente");
      setClienteSeleccionado(null);
      setRecargarClientesRelacionados(!recargarClientesRelacionados);
    }
    catch (error) {
      console.log(error);
    }
  }

  const handleEliminarClienteRelacionado = async (codigoCliente) => {
    try {
      if (!codigoCliente) {
        toastr.info("Seleccione un cliente");
        return;
      }

      const result = await RepresentantesService.eliminarClienteRelacionado({
        codigoRepresentante: representante?.CODIGO_REPRESENTANTE || 0,
        codigoCliente: codigoCliente,
        servidor: session.profile.servidor,
      });

      if (!result?.isValid) {
        toastr.error(result?.message || "Operación no válida");
        return;
      }

      toastr.success(result?.message || "Relación eliminada correctamente");
      setRecargarClientesRelacionados(!recargarClientesRelacionados);
    }
    catch (error) {
      console.log(error);
    }
  }

  const handleSelectCliente = (selectedOption) => {
    setClienteSeleccionado(selectedOption);
  };

  return (
    <Modal isOpen={isModalOpen} toggle={toggle} size="lg">
      <Formik initialValues={initialValues} validationSchema={RepresentantesFormSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue, handleSubmit, isSubmitting }) => {
          return (
            <Form onSubmit={handleSubmit}>
              <ModalHeader className="bg-primary text-white" toggle={toggle}>
                {representante ? "Editar Representante" : "Agregar Representante"}
              </ModalHeader>

              <ModalBody>
                <Row>
                  {/* Columna izquierda */}
                  <Col md="6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="codigo_representante">Código</label>
                      <Field name="codigo_representante" as={Input} className="form-control" disabled />
                    </div>

                    <div className="form-group mt-3">
                      <label className="form-label" htmlFor="nombre_representante">Nombre</label>
                      <Field
                        autoComplete="given-name"
                        name="nombre_representante"
                        as={Input}
                        className="form-control"
                      />
                      <ErrorMessage name="nombre_representante" component="div" className="text-danger" />
                    </div>

                    <div className="form-group mt-3">
                      <label className="form-label" htmlFor="porcentaje_comision">Porcentaje de Comisión</label>
                      <Field name="porcentaje_comision" type="number" as={Input} className="form-control" />
                      <ErrorMessage name="porcentaje_comision" component="div" className="text-danger" />
                    </div>

                    <div className="form-group mt-3">
                      <label className="form-label" htmlFor="cod_zona">Zona</label>
                      <Select
                        name="cod_zona"
                        options={isLoadingZonas ? [] : zonas}
                        onChange={(opt) => setFieldValue("cod_zona", opt?.value ?? "")}
                        value={zonas.find((z) => z.value === values.cod_zona) || null}
                        placeholder="Seleccione una zona..."
                      />
                      <ErrorMessage name="cod_zona" component="div" className="text-danger" />
                    </div>

                    <div className="form-group mt-3">
                      <label className="form-label" htmlFor="observaciones">Observaciones</label>
                      <Field maxLength={100} name="observaciones" as={Input} className="form-control" />
                    </div>
                  </Col>

                  {/* Columna derecha */}
                  <Col md="6" style={{ visibility: representante ? "visible" : "hidden" }}>
                    <div className="form-group">
                      <AsyncSelect
                        id="modalRepresentanteCliente"
                        loadOptions={clientesOptions}
                        onChange={handleSelectCliente}
                        placeholder="Seleccione cliente"
                        value={clienteSeleccionado}
                        styles={customStyles}
                      />
                      <Button color="primary" className="mt-2" type="button" onClick={handleGrabarClienteRelacionado} disabled={!representante}>
                        Agregar
                      </Button>
                      <UncontrolledTooltip placement="top" target="modalRepresentanteCliente">
                        Si el cliente pertenece a un grupo, se agregarán también todos los clientes relacionados a dicho grupo.
                      </UncontrolledTooltip>
                    </div>

                    <div className="form-group mt-3">
                      <Table responsive bordered hover size="sm">
                        <thead>
                          <tr>
                            <th style={{ width: 110 }}>Código</th>
                            <th>Nombre</th>
                            <th style={{ width: 120 }}>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clientesRelacionados.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="text-center text-muted">
                                Sin clientes relacionados
                              </td>
                            </tr>
                          ) : (
                            clientesRelacionados.map((row) => (
                              <tr key={row.value}>
                                <td>{row.value}</td>
                                <td>{row.label}</td>
                                <td>
                                  <Button color="danger" size="sm" type="button" onClick={() => handleEliminarClienteRelacionado(row.value)}>
                                    Eliminar
                                  </Button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>
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
                    {representante ? "Guardar Cambios" : "Agregar"}
                    {isSubmitting && <span className="spinner-border spinner-border-sm ml-2"></span>}
                  </Button>
                  <Button className="ml-2" color="secondary" type="button" onClick={toggle}>
                    Cancelar
                  </Button>
                </div>
              </ModalFooter>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
};
