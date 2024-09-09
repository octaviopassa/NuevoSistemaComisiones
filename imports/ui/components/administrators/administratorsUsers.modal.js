import { t } from "i18next";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
import RolesService from "../roles/roles.service";
import toastr from "toastr";
import loadingModal from "../global/Loading";
import Select from "react-select";

function ModalUsuarios({ usuario, roleId, ...props }) {
  const { t } = useTranslation();
  console.log("roleId", roleId);
  const [selectedRole, setSelectedRole] = useState(roleId);

  let formulario = useInput({
    _id: {
      value: usuario._id ? usuario._id : "",
      schema: {
        type: String,
        optional: true,
      },
    },
    username: {
      value: usuario.username ? usuario.username : "",
      schema: {
        label: t("users.admin.modal.userLabel"),
        type: String,
        min: 6,
        required: true,
      },
    },
    password: {
      value: usuario.password ? usuario.password : "",
      schema: {
        label: t("users.admin.modal.passwordLabel"),
        type: String,
        min: usuario._id == "" ? 6 : 0,
        required: usuario._id == "" ? true : false,
      },
    },
    nombreCompleto: {
      value: usuario.profile.nombreCompleto
        ? usuario.profile.nombreCompleto
        : "",
      schema: {
        type: String,
        label: t("users.admin.modal.nameLabel"),
        required: true,
        min: 3,
      },
    },
    roleId: {
      value: roleId ? roleId : "",
      schema: {
        label: t("users.admin.modal.roleLabel"),
        type: String,
        required: true,
      },
    },
  });

  const [open, setOpen] = useState(true);
  const [roles, setRoles] = useState([]);
  useEffect(() => {
    asyncLoad();
  }, []);

  const asyncLoad = async () => {
    console.log("usuario", usuario);
    const rolesResponse = await RolesService.getAll();
    function transformArray(array) {
      return array.map((item) => ({
        value: item._id,
        modules: item.modules,
        label: item.name,
      }));
    }

    setRoles(transformArray(rolesResponse));
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

  return (
    <Modal isOpen={open} toggle={toggle}>
      <ModalHeader toggle={toggle}>{t("users.admin.modal.title")}</ModalHeader>
      <ModalBody>
        <Input
          placeholder={t("users.admin.modal.userPlaceholder")}
          {...formulario.username}
        />
        {formulario._id.value == "" ? (
          <Input
            etiqueta={t("users.admin.modal.passwordLabel")}
            placeholder={t("users.admin.modal.passwordPlaceholder")}
            {...formulario.password}
          />
        ) : (
          <span></span>
        )}
        <Input
          etiqueta={t("users.admin.modal.nameLabel")}
          placeholder={t("users.admin.modal.namePlaceholder")}
          {...formulario.nombreCompleto}
        />

        <div style={{ display: "flex", flexDirection: "column" }}>
          <Label>{t("users.admin.modal.roleLabel")}</Label>
          <Select
            options={roles}
            onChange={(selectedOption) => {
              const e = {
                target: selectedOption,
              };

              console.log(selectedOption);
              formulario.roleId.onChange(e);
            }}
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

export default ModalUsuarios;
