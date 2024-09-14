import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { Label } from "reactstrap";
import toastr from "toastr";
import UserService from "../../../services/user";
import useUserLenguageStore from "../../../store/userLenguage";
import useUserLoggedStore from "../../../store/userLogged";
import useUserModulesStore from "../../../store/userModules";
import useUserRolStore from "../../../store/userRol";
import useUserSession from "../../../store/userSession";
import { LoginSchema } from "../schemas";

export const LoginForm = ({ empresas }) => {
  const { i18n } = useTranslation();
  const { setAllowedModules } = useUserModulesStore();
  const { setUserLenguage } = useUserLenguageStore();
  const { setUserLogged } = useUserLoggedStore();
  const { setUserSession } = useUserSession();
  const { setUserRol } = useUserRolStore();

  const handleSubmit = async (values) => {
    const { user, password, empresa: empresaSeleccionada } = values;

    try {
      if (user == "roberto" || user == "jorge" || user == "ernesto") {
        Meteor.loginWithPassword(user, password, async (error) => {
          if (error) {
            toastr.warning(error.reason);
            return;
          }

          const localUser = Meteor.user();

          const bitacora = {
            fechaCreacion: new Date(),
            usuarioId: localUser._id,
            modulo: "Iniciar Sesión",
            descripcion: "Inició Sesión",
          };

          await UserService.saveBitacora(bitacora);

          const allowedModules = await UserService.allowedModules(
            localUser._id
          );

          const rol = await Meteor.callAsync(
            "roles.getUserRole",
            localUser._id,
            true
          );

          localUser.profile.rol = rol;
          setUserLogged(true);

          setUserRol(rol.name);
          setUserSession(localUser);
          setAllowedModules(allowedModules);
          setUserLenguage(localUser?.profile?.idioma);

          i18n.changeLanguage(localUser.profile.idioma);

          toastr.success("Bienvenido", localUser.profile.nombreCompleto);
        });
      } else {
        const empresa = {
          ...JSON.parse(empresaSeleccionada.value),
          params: { nombre_usuario: user, contrasenia: password },
        };

        const respuesta = await UserService.loginWithPassa(empresa);

        if (!respuesta.success) {
          console.log("Respuesta:", respuesta);
          toastr.error("Aviso", respuesta.message);
          return;
        }

        const { data } = respuesta;

        Meteor.loginWithToken(data.token, async (loginError) => {
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
      }
    } catch (e) {
      toastr.error("Aviso", e.reason);
    }
  };

  return (
    <div className="card p-4 rounded-plus bg-faded">
      <Formik
        initialValues={{
          user: "",
          password: "",
          empresa: null,
        }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({
          errors,
          touched,
          values,
          isSubmitting,
          setFieldValue,
          handleChange,
        }) => (
          <Form>
            <div className="form-group">
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Label>Empresas</Label>
                <Select
                  name="empresas"
                  options={empresas}
                  className="basic-multi-select"
                  placeholder="Seleccione..."
                  onChange={(selectedOption) =>
                    setFieldValue("empresa", selectedOption)
                  }
                  value={values.empresa}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="user">
                Usuario
              </label>
              <Field
                value={values.user}
                onChange={handleChange}
                type="text"
                id="user"
                name="user"
                className={`form-control form-control-lg ${
                  errors.user && touched.user && "is-invalid"
                } `}
                placeholder="Ingresa tu usuario"
                required
              />

              <ErrorMessage
                name="user"
                component="div"
                className="invalid-feedback error"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <Field
                value={values.password}
                onChange={handleChange}
                type="password"
                id="password"
                name="password"
                className={`form-control form-control-lg ${
                  errors.password && touched.password && "is-invalid"
                } `}
                placeholder="Ingresa tu contraseña"
                required
              />

              <ErrorMessage
                name="password"
                component="div"
                className="invalid-feedback error"
              />
            </div>
            <div className="row no-gutters">
              <div className="col-lg-6 pr-lg-1 my-2"></div>
              <div className="col-lg-6 pl-lg-1 my-2">
                <button
                  id="js-login-btn"
                  className="btn btn-primary btn-block btn-lg waves-effect waves-themed"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
