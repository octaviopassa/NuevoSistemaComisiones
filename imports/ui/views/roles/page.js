import React, { useEffect, useState } from "react";
import { Alert, Badge, Button } from "reactstrap";
import toastr from "toastr";
import { useTranslation } from "react-i18next";
import RolesService from "../../components/roles/roles.service";
import PageService from "../../components/pages/pages.service";
import ProtectModule from "../../components/global/HProtectModule";
import ModalRoles from "../../components/roles/roles.modal";
import Page from "../../components/global/Page";
import { Subheader } from "../../components/global/Subheader";
import { showModal } from "../../components/global/Modal";
import Select from "react-select";

function Roles(props) {
  const { t } = useTranslation();
  const subheader = {
    icono: "fal fa-user",
    titulo: t("roles.title"),
    subTitulo: t("roles.subtitle"),
    etiqueta: t("roles.tag"),
    descripcion: t("roles.description"),
    derecha: t("roles.right"),
    breadcrumbs: [
      t("roles.breadcrumbs1"),
      t("roles.breadcrumbs2"),
      t("roles.breadcrumbs3"),
    ],
  };

  const [roles, setRoles] = useState([]);
  const [selectedSubroleId, setSelectedSubroleId] = useState("");
  const [pages, setPages] = useState([]);

  const asyncLoad = async () => {
    RolesService.getAll()
      .then((roles) => {
        setRoles(roles);
      })
      .catch((error) => {
        // Manejo de errores
      });
    // setRoles(tmp);
  };

  useEffect(() => {
    asyncLoad();
  }, []);

  const openModal = (item) => {
    showModal(ModalRoles, { item, successfulCompletion: asyncLoad });
  };

  const sinPermiso = () => {
    return <Alert>Sin permiso</Alert>;
  };

  const loadPermisos = async (item) => {
    try {
      let activeModules = [];

      if (item !== undefined) {
        const roleId = item._id;
        activeModules = await RolesService.modulesId(roleId);
      }

      const pages = await PageService.getAllWithModules();
      for (const page of pages) {
        page.modules = page.modules.map((m) => {
          const findedModule = activeModules.find(
            (idActiveModule) => idActiveModule === m._id
          );
          return { checked: findedModule !== undefined ? true : false, ...m };
        });
      }

      setPages(pages);
    } catch (e) {
      console.log("error", e);
    }
  };

  const handleCheckbox = (page, module) => {
    const tmp = Array.from(pages);

    const m = tmp[page].modules[module];
    m.checked = !m.checked;

    setPages(tmp);
  };

  const save = async (role) => {
    if (role.name.length === 0) {
      toastr.warning(t("roles.warning.mustContainName"));
      return;
    }

    try {
      const selectedModules = pages
        .map((p) => p.modules.filter((m) => m.checked))
        .flat();

      const dataSaveRole = {
        id: role._id !== undefined ? role._id : null,
        name: role.name,
        modules: selectedModules.map((m) => m._id),
        subroles: role.subroles,
      };
      console.log({ dataSaveRole });
      const id = await RolesService.save(dataSaveRole);
      console.log(id);
      if (id != null) {
        toastr.success("Actualizado correctamente", "Permisos");
      }
    } catch (ex) {
      toastr.error(t("roles.error.failedToSave"));
      console.log(ex);
    }
  };

  const handleOnSelectSubrole = (roleId) => {
    setSelectedSubroleId(roleId);
  };

  const handleSelectRole = (role) => {
    loadPermisos(role);
    setSelectedSubroleId("");
  };

  const handleAddSubrole = (id, subroleId, remove = false) => {
    const tmpRoles = Array.from(roles);
    const role = tmpRoles.find((r) => r._id == id);

    if (role.subroles.includes(subroleId) && !remove) {
      toastr.error(t("roles.error.subRoleIsAlreadyOnTheList"));
      return;
    }

    if (remove) {
      role.subroles = role.subroles.filter((p) => p !== subroleId);
    } else {
      role.subroles.push(subroleId);
      setSelectedSubroleId("");
    }

    setRoles(tmpRoles);
  };

  const getRolesBySubrolesId = (subrolesId) => {
    return roles.filter((role) => subrolesId.includes(role._id));
  };

  return (
    <Page name="Roles">
      <Subheader data={subheader} />

      <ProtectModule method="remove" module="view" ifNot={sinPermiso}>
        <div className="row">
          <div className="col-sm-2">
            <ProtectModule method="remove" module="create">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  openModal();
                }}
              >
                {t("button.new")}
              </button>
            </ProtectModule>
          </div>
        </div>
        <br />
        <ProtectModule method="remove" module="view">
          <div className="row ">
            <div className="col-auto">
              <div
                className="nav flex-column nav-pills"
                id="v-pills-tab"
                role="tablist"
                aria-orientation="vertical"
              >
                {roles.map((rol, index) => (
                  <a
                    key={index}
                    className="nav-link"
                    id={"tap" + index}
                    data-toggle="pill"
                    href={"#contenido" + index}
                    role="tab"
                    aria-controls={rol._id}
                    aria-selected="false"
                    onClick={() => {
                      handleSelectRole(rol);
                    }}
                  >
                    <i className="fal fa-home"></i>
                    <span className="hidden-sm-down ml-1">{rol.name}</span>
                  </a>
                ))}
              </div>
            </div>
            <div className="col">
              <div className="tab-content" id="v-pills-tabContent">
                {roles.map((rol, index) => (
                  <div
                    key={index}
                    className="tab-pane fade"
                    id={"contenido" + index}
                    role="tabpanel"
                    aria-labelledby={rol._id}
                  >
                    <ProtectModule method="remove" module="edit">
                      <button
                        className="btn btn-primary btn-sm "
                        onClick={() => {
                          openModal(rol);
                        }}
                      >
                        {t("button.edit")}
                      </button>
                    </ProtectModule>
                    <ProtectModule method="remove" module="create">
                      <button
                        className="btn btn-primary btn-sm pull-right"
                        onClick={() => save(rol)}
                      >
                        {t("button.save")}
                      </button>
                      <br />
                    </ProtectModule>
                    {/* <hr style={{ marginTop: "35px" }} /> */}

                    {/* <p>
                      <b> {t("roles.subroles.title")} </b>
                    </p>

                    <div
                      style={{
                        width: "40%",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <select
                        style={{
                          padding: "5px",
                          width: "140px",
                          borderRadius: 5,
                        }}
                        onChange={(e) => handleOnSelectSubrole(e.target.value)}
                        value={selectedSubroleId}
                      >
                        <option value="" disabled>
                          {t("roles.subroles.select.title")}
                        </option>
                        {roles
                          .filter((r) => r._id !== rol._id)
                          .map((role) => (
                            <option key={role._id} value={role._id}>
                              {role.name}
                            </option>
                          ))}
                      </select>


                      <Button
                        size="sm"
                        color="primary"
                        style={{ marginLeft: 15 }}
                        disabled={selectedSubroleId == ""}
                        onClick={() =>
                          handleAddSubrole(rol._id, selectedSubroleId)
                        }
                      >
                        {t("roles.subroles.add")}
                      </Button>
                    </div> */}

                    <div
                      style={{
                        width: "35%",
                        display: "flex",
                        flexWrap: "wrap",
                        marginTop: 10,
                      }}
                    >
                      {getRolesBySubrolesId(rol.subroles).map((subrole) => (
                        <Badge
                          key={subrole._id}
                          color="primary"
                          style={{
                            color: "white",
                            lineHeight: "1.5",
                            marginRight: 5,
                          }}
                        >
                          <span>{subrole.name}</span>
                          <button
                            className="btn"
                            style={{
                              padding: "0px 10px",
                              color: "red",
                              fontWeight: "bold",
                            }}
                            onClick={() =>
                              handleAddSubrole(rol._id, subrole._id, true)
                            }
                          >
                            x
                          </button>
                        </Badge>
                      ))}
                    </div>

                    <hr />
                    <p>
                      <b> {t("roles.modules.title")} </b>
                    </p>
                    {pages.map((p, pIdx) => (
                      <div className="row" key={pIdx}>
                        <div className="col-sm-12">
                          <div className="accordion" id="accordionExample">
                            <div className="card">
                              <div className="card-header" id="headingOne">
                                <a
                                  href="#"
                                  className="card-title collapsed"
                                  data-toggle="collapse"
                                  data-target={"#acordion" + pIdx}
                                  aria-expanded="false"
                                  aria-controls="collapseOne"
                                >
                                  {p.name}
                                  <span className="ml-auto">
                                    <span className="collapsed-reveal">
                                      <i className="fal fa-minus-circle text-danger"></i>
                                    </span>
                                    <span className="collapsed-hidden">
                                      <i className="fal fa-plus-circle text-success"></i>
                                    </span>
                                  </span>
                                </a>
                              </div>
                              <div
                                id={"acordion" + pIdx}
                                className="collapse"
                                aria-labelledby="headingOne"
                                data-parent={"#acordion" + pIdx}
                              >
                                <div className="card-body no-padding">
                                  <table className="table table-bordered no-margin">
                                    <tbody>
                                      {p.modules.map((m, mIdx) => (
                                        <tr key={m._id}>
                                          <td>{m.description}</td>
                                          <td className="text-center col-sm-1">
                                            <input
                                              type="checkbox"
                                              checked={m.checked}
                                              onChange={() =>
                                                handleCheckbox(pIdx, mIdx)
                                              }
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ProtectModule>

        <ProtectModule method="hide" module="watch_roles">
          <div></div>
        </ProtectModule>

        <ProtectModule method="remove" module="menu">
          <div></div>
        </ProtectModule>

        <ProtectModule method="remove" module="export_role">
          <div></div>
        </ProtectModule>
      </ProtectModule>
    </Page>
  );
}

export default Roles;
