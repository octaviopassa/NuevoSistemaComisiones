import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor";
// import { useNavigate } from "react-router"
import { useTranslation } from "react-i18next";
import toastr from "toastr";
import UserService from "../../services/user";
import useUserLoggedStore from "../../store/userLogged";
import useUserLenguageStore from "../../store/userLenguage";
import useUserModulesStore from "../../store/userModules";
import useUserRolStore from "../../store/userRol";
import useUserSession from "../../store/userSession";
import EmpresasService from "../../services/empresas";
import Select from "react-select";
import { Label } from "reactstrap";

function LoginForm() {
  const { t, i18n } = useTranslation();
  const { setAllowedModules } = useUserModulesStore();
  const { setUserLenguage } = useUserLenguageStore();
  const { setUserLogged } = useUserLoggedStore();
  const { setUserSession } = useUserSession();
  const { setUserRol } = useUserRolStore();

  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);

  useEffect(() => {
    const load = async () => {
      const e = await EmpresasService.getAll();
      setEmpresas(transformEmpresas(e));
    };

    load();
  }, []);

  const login = async (event) => {
    try {
      event.preventDefault();

      if (usuario == "roberto" || usuario == "jorge" || usuario == "ernesto") {
        Meteor.loginWithPassword(usuario, contrasena, async (error) => {
          if (error) {
            toastr.warning(error.reason);
            return;
          }

          const user = Meteor.user();

          const bitacora = {
            fechaCreacion: new Date(),
            usuarioId: user._id,
            modulo: "Iniciar Sesión",
            descripcion: "Inició Sesión",
          };

          await UserService.saveBitacora(bitacora);

          const allowedModules = await UserService.allowedModules(user._id);

          const rol = await Meteor.callAsync(
            "roles.getUserRole",
            user._id,
            true
          );

          user.profile.rol = rol;
          setUserLogged(true);

          setUserRol(rol.name);
          setUserSession(user);
          setAllowedModules(allowedModules);
          setUserLenguage(user?.profile?.idioma);

          i18n.changeLanguage(user.profile.idioma);

          toastr.success("Bienvenido", user.profile.nombreCompleto);
        });
      } else {
        const empresa = {
          ...JSON.parse(empresaSeleccionada.value),
          params: { nombre_usuario: usuario, contrasenia: contrasena },
        };

        const respuesta = await UserService.loginWithPassa(empresa);

        if (respuesta.success) {
          const user = respuesta.data;

          Meteor.loginWithToken(user.token, async (loginError) => {
            if (loginError) {
              console.error("Login Error:", loginError);
            } else {
              const usuario = Meteor.user();
              const bitacora = {
                fechaCreacion: new Date(),
                usuarioId: usuario._id,
                modulo: "Iniciar Sesión",
                descripcion: "Inició Sesión",
              };
              await UserService.saveBitacora(bitacora);
              const allowedModules = await UserService.allowedModules(
                usuario._id
              );

              const rol = await Meteor.callAsync(
                "roles.getUserRole",
                usuario._id,
                true
              );

              usuario.profile.rol = rol;
              setUserLogged(true);
              setUserRol(rol.name);
              setUserSession(usuario);
              setAllowedModules(allowedModules);
              toastr.success(
                "Bienvenido",
                respuesta.data.userData.NOMBRE_COMPLETO
              );
            }
          });
        } else {
          toastr.error("Aviso", respuesta.message);
        }
      }
    } catch (e) {
      toastr.error("Aviso", e.reason);
    }
  };

  const handleChangeEmpresas = async (selectedOption) => {
    console.log(selectedOption);
    setEmpresaSeleccionada(selectedOption);
  };

  function transformEmpresas(array) {
    return array.map((item) => ({
      value: JSON.stringify(item),
      label: item.BASE_DATOS.trim(),
    }));
  }

  return (
    <div>
      <div className="page-wrapper auth">
        <div className="page-inner bg-brand-gradient">
          <div className="page-content-wrapper bg-transparent m-0">
            <div className="flex-1 backMain">
              <div className="container py-4 py-lg-5 my-lg-5 px-4 px-sm-0">
                <div className="row">
                  <div className="col col-md-6 col-lg-7 hidden-sm-down">
                    <img src="/img/logo.png" width={300} />
                    <h2 className="fs-xxl fw-500 mt-4 text-white">
                      Sistema de Reembolsos
                    </h2>
                    <div className="fs-lg fw-300 p-5 bg-white border-faded rounded mb-g">
                      <h3 className="mb-g">Seguimiento de Reembolsos</h3>
                      <p className="text-justify">
                        ¡Bienvenido a nuestro sistema de gestión de Reembolsos!
                      </p>
                      <p className="text-justify"></p>
                      <p className="text-justify"></p>
                      <p className="text-justify"></p>
                    </div>
                  </div>
                  <div className="col-sm-12 col-md-6 col-lg-5 col-xl-4 ml-auto">
                    <h2 className="fs-xxl fw-500 mt-4 text-white">
                      {t("login.login")}
                    </h2>
                    <div className="card p-4 rounded-plus bg-faded">
                      <form onSubmit={login}>
                        <div className="form-group">
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <Label>Empresas</Label>
                            <Select
                              name="empresas"
                              options={empresas}
                              className="basic-multi-select"
                              placeholder="Seleccione..."
                              onChange={handleChangeEmpresas}
                              value={
                                empresaSeleccionada ? empresaSeleccionada : null
                              }
                            />
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="usuario">
                            {t("login.userLabel")}
                          </label>
                          <input
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            type="text"
                            id="usuario"
                            className="form-control form-control-lg"
                            placeholder={t("login.userPlaceholder")}
                            required=""
                          />
                          <div className="invalid-feedback">
                            {t("login.userRequiredText")}
                          </div>
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="password">
                            {t("login.passwordLabel")}
                          </label>
                          <input
                            value={contrasena}
                            onChange={(e) => setContrasena(e.target.value)}
                            type="password"
                            id="password"
                            className="form-control form-control-lg"
                            placeholder={t("login.passwordPlaceholder")}
                            required=""
                          />
                          <div className="invalid-feedback">
                            {t("login.passowrdRequiredText")}
                          </div>
                        </div>
                        <div className="row no-gutters">
                          <div className="col-lg-6 pr-lg-1 my-2"></div>
                          <div className="col-lg-6 pl-lg-1 my-2">
                            <button
                              id="js-login-btn"
                              className="btn btn-primary btn-block btn-lg waves-effect waves-themed"
                              type="submit"
                            >
                              {t("login.loginButton")}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="position-absolute pos-bottom pos-left pos-right p-3 text-center text-white">
                  Sistema de Reembolsos
                  <a
                    href="https://www.calzzapato.com"
                    className="text-white opacity-40 fw-500 ml-3"
                    title="calzzapato.com"
                    target="_blank"
                  >
                    passa.com
                  </a>
                  <div className="float-right">v0.0.1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
