import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "empresas.getAll": async () => {
    conexiones.body_empresas.tipo = "consulta";
    conexiones.body_empresas.query = "SELECT * FROM empresas..CAT_DB_EMPRESAS";
    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_empresas,
    });

    return JSON.parse(response.data.data.resultado);
  },
  "plazas.getAll": async (datos) => {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.query =
      "EXEC MP_WEB_LOGIN_PAZAS_USUARIO " +
      " @Cod_Usu  = '" +
      datos.cod_usu +
      "'," +
      " @EsLogin = 0";
    conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;
    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "ingenieros.getAll": async (datos) => {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.query =
      "exec SPCB_Carga_Combo_Ingenieros @Plaza= '" +
      datos.plaza +
      "', @HTML = 0";
    conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;
    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "combustibles.getAll": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.query =
        "SELECT TIPO_COMBUSTIBLE Codigo, NOM_TIPO_COMBUSTIBLE Nombre FROM CAT_TIPOS_COMBUSTIBLES";
      console.log(conexiones.body_bdseleccionada.query);
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
});
