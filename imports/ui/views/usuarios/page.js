import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toastr from "toastr";
import ProtectModule from "../../components/global/ProtectModule";
import AdministratorServices from "../../components/administrators/administrators.service";
import ModalCambiarContrasena from "../../components/administrators/changePassword.modal";
import ModalUsuarios from "../../components/administrators/administratorsUsers.modal";
import RolesService from "../../components/roles/roles.service";
import { Subheader } from "../../components/global/Subheader";
import { ocultarDropdown } from "../../../../client/js/sync";
import { showModal } from "../../components/global/Modal";
import Page from "../../components/global/Page";
import { useUserSession } from "../../store";
import { Link } from "react-router-dom";
import { formatDateUser, formatDuration } from "../../../utils/utils";

const Usuarios = () => {
  const { t } = useTranslation();
  const [usuarios, setUsuarios] = useState([]);
  const [rol, setRol] = useState("");
  const { session } = useUserSession();
  const user = {
    ...session,
  };
  window.usuarios = [];

  const subheader = {
    icono: "fal fa-users",
    titulo: "Usuarios",
    subTitulo: t("users.admin.subtitle"),
    etiqueta: t("users.admin.tag"),
    descripcion: "Su Rol: " + rol?.name,
    derecha: t("users.admin.right"),
    breadcrumbs: [t("users.admin.breadcrumbs1"), t("users.admin.breadcrumbs3")],
  };

  const renderUsers = () =>
    usuarios.map((usuario, i) => (
      <tr key={i}>
        <td className="text-center">{i + 1}</td>
        <td>{usuario.rolObj.name} </td>
        <td>{usuario.username} </td>
        <td>
          <Link to={`/proveedoresUsuario/${usuario._id}`}>
            {usuario.profile.nombreCompleto}
          </Link>
        </td>
        <td className="text-center">
          {usuario.profile.fechaUltimaSesion ? (
            <div>
              <span className="badge badge-primary">
                {formatDateUser(usuario.profile.fechaUltimaSesion)}{" "}
              </span>
              <br />

              <span className="badge badge-info">
                {formatDuration(usuario.profile.fechaUltimaSesion, Date.now())}
              </span>
            </div>
          ) : (
            <span className="badge badge-warning">Sin inicio</span>
          )}
        </td>

        <td className="text-center">
          {usuario.profile.estatus ? (
            <span className="badge badge-primary">{t("status.active")}</span>
          ) : (
            <span className="badge badge-danger">{t("status.inactive")}</span>
          )}
        </td>
        <td className="text-center">
          <div className="btn-group dropleft">
            <button
              type="button"
              className="btn btn-primary btn-sm dropdown-toggle waves-effect waves-themed"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            ></button>
            <div className="dropdown-menu">
              <a
                className="dropdown-item"
                href="#"
                onClick={() => editar(usuario)}
              >
                <i className="fal fa-pencil text-primary mr-3"></i>
                {t("button.edit")}
              </a>
              <a
                className="dropdown-item"
                href="#"
                onClick={() => seleccionarProveedor(usuario)}
              >
                <i className="fal fa-user text-primary mr-3"></i>
                Asignar Proveedor
              </a>

              <a
                className="dropdown-item"
                href="#"
                onClick={() => cambiarContrasena(usuario._id)}
              >
                <i className="fal fa-lock text-primary mr-3"></i>
                {t("button.changePassword")}
              </a>
              <a
                className="dropdown-item"
                href="#"
                onClick={() => cambiarEstatus(usuario._id)}
              >
                {usuario.profile.estatus ? (
                  <i className="fal fa-trash text-danger mr-3"></i>
                ) : (
                  <i className="fal fa-check text-success mr-3"></i>
                )}
                {usuario.profile.estatus ? "Deshabilitar" : "Habilitar"}
              </a>
            </div>
          </div>
        </td>
      </tr>
    ));

  const cambiarEstatus = async (usuario_id) => {
    ocultarDropdown();
    await Meteor.callSync("usuario.cambiarEstatus", usuario_id);
    asyncLoad();
  };

  const cambiarContrasena = async (usuario_id) => {
    const data = await showModal(ModalCambiarContrasena, {
      usuario_id: usuario_id,
    });
  };

  const seleccionarProveedor = async (usuario) => {
    const data = await showModal(ModalProveedoresDepto, {
      user: usuario,
    });

    if (data) {
      toastr.success("Agregado correctamente", "Proveedor");
    }
  };

  const asyncLoad = async () => {
    try {
      const role = await RolesService.getUserRoleName(user._id, true);
      setRol(role);
      if (role.name == "Gerente") {
        AdministratorServices.getByDepartamento(
          user.profile.departamentoExterno_id
        ).then((response) => {
          setUsuarios(response);
        });
      } else if (role.name == "Asistente") {
        AdministratorServices.getByDepartamento(
          user.profile.departamentoExterno_id
        ).then((response) => {
          setUsuarios(response);
        });
      } else if (role.name == "Admin" || role.name == "SuperAdmin") {
        AdministratorServices.getAll().then((response) => {
          setUsuarios(response);
          window.usuarios = response;
        });
      }
    } catch (e) {
      console.log("error", e);
    }
  };

  const editar = async (usuario) => {
    const roleIdResponse = await RolesService.getUserRole(usuario._id);

    usuarioCustom = {
      _id: usuario._id,
      username: usuario.username,
      profile: usuario.profile,
    };

    ocultarDropdown();

    const data = await showModal(ModalUsuarios, {
      usuario: usuarioCustom,
      roleId: roleIdResponse,
    });
    if (data) {
      toastr.success(t("success.updated"), t("status.notice"));
      asyncLoad();
    }
  };

  const nuevo = async () => {
    const data = await showModal(ModalUsuarios, { usuario: { profile: {} } });
    if (data) {
      toastr.success(t("success.created"), t("status.notice"));
      asyncLoad();
    }
  };

  useEffect(() => {
    asyncLoad();
  }, []);

  return (
    <Page name="Usuarios">
      <Subheader data={subheader} />
      <ProtectModule method="remove" module="create">
        <div className="row">
          <div className="col-sm-2 mb-2 ">
            <button className="btn btn-primary btn-sm " onClick={nuevo}>
              Nuevo
            </button>
          </div>
        </div>
      </ProtectModule>
      <div className="row">
        <div className="col-sm-12">
          <table className="table table-bordered table-sm tablaResponsiva">
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th className="text-center">Rol</th>
                <th className="text-center">Usuario</th>
                <th className="text-center">Nombre Completo</th>
                <th className="text-center">Última Sesión</th>
                <th className="text-center">Estatus</th>
                <th className="text-center" width="200">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>{renderUsers()}</tbody>
          </table>
        </div>
      </div>
    </Page>
  );
};

export default Usuarios;
