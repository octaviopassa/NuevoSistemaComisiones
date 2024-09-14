
import { t } from "i18next";
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
} from "reactstrap";
import useInput from "../../../startup/client/useInput";
import Input from "../global/Input";
import toastr from "toastr";
import loadingModal from "../global/Loading";
import Select from "react-select";
import { ProveedoresService, DepartamentosService } from "../../services";

function ModalEmpleados({ empleado, ...props }) {
  let formulario = useInput({
    _id: {
      value: empleado._id ? empleado._id : "",
      schema: {
        type: String,
        optional: true,
      },
    },
    empleado: {
      value: empleado.nombre ? empleado.nombre.trim() + " " + empleado.apellidoPaterno.trim() + " " + empleado.apellidoMaterno.trim() : "",
      schema: {
        label: "Empleado",
        type: String,
        min: 6,
        required: true,
      },
    },
  });

  const [open, setOpen] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [proveedoresSeleccionados, setProveedoresSeleccionado] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);

  useEffect(() => {
    asyncLoad();    
  }, []);

  function transformProveedores(array) {
    return array.map((item) => ({
      value: item.CPROVEEDOR,
      label: item.CDESCRIP,
    }));
  }

  function transformDepartamentos(array) {
    return array.map((item) => ({
      value: item.id,
      label: item.descripcion.trim(),
    }));
  }

  const asyncLoad = async () => {
    const proveedoresResponse = await ProveedoresService.getAll();
    setProveedores(transformProveedores(proveedoresResponse));
    const departamentosResponse = await DepartamentosService.getAll();
    const departamentosTransformados = transformDepartamentos(departamentosResponse);
    setDepartamentos(departamentosTransformados);
  
    // Seleccionar el departamento del empleado
    const departamentoEmpleado = departamentosTransformados.find(d => d.value === empleado.departamentoId);
    console.log("depto Empleado", departamentoEmpleado);
    if (departamentoEmpleado) {
      setDepartamentoSeleccionado(departamentoEmpleado);
    }
  };

  const toggle = () => {
    setOpen(!open);
  };

  const guardar = async () => {
    try {
      loadingModal(true);
      if (!formulario.isValid()) {
        toastr.warning("Completa correctamente los campos marcados");
        loadingModal(false);
        return;
      }
      const dataUserSave = formulario.toObject();
      delete dataUserSave.roleId;
      console.log(dataUserSave, formulario.roleId.value);
      await Meteor.callSync("usuario.save", [
        dataUserSave,
        formulario.roleId.value,
      ]);
      loadingModal(false);
      setOpen(false);
      setTimeout(props.exit, 300);
      props.result(formulario.toObject());
    } catch (error) {
      loadingModal(false);
      console.log(error);
    }
  };

  const cancelar = () => {
    setOpen(false);
    setTimeout(props.exit, 300);
    props.result(null);
  };

  const handleChangeProveedores = (proveedoresSeleccionados) => {
    setProveedoresSeleccionado(proveedoresSeleccionados);
    console.log(`Proveedores`, proveedoresSeleccionados);
  };

  const handleChangeDepartamento = (departamento) => {
    setDepartamentoSeleccionado(departamento);
    console.log(`Departamento:`, departamento);
  };

  return (
    <Modal isOpen={open} toggle={toggle}>
      <ModalHeader toggle={toggle}>Crear Usuario</ModalHeader>
      <ModalBody>
        <Input
          placeholder="Nombre"
          {...formulario.empleado}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Label>Departamento</Label>
          <Select
            name="departamentos"
            options={departamentos}
            className="basic-single"
            placeholder="Seleccione..."
            onChange={handleChangeDepartamento}
            value={departamentoSeleccionado}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Label>Proveedores</Label>
          <Select
            isMulti
            name="proveedores"
            options={proveedores}
            className="basic-multi-select"
            placeholder="Seleccione..."
            onChange={handleChangeProveedores}
            value={proveedoresSeleccionados}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={cancelar}>
          {t("button.close")}
        </Button>
        <Button color="primary" onClick={guardar}>
          {t("button.save")}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default ModalEmpleados;
