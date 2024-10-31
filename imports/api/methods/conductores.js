import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "conductores.getAll": async (plaza, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = plaza
        ? `exec SP_CAT_CONDUCTORES_Consulta @Cod_Conductor='', @Nom_Conductor='', @Estatus='', @Cod_Plaza='${plaza}'`
        : "exec SP_CAT_CONDUCTORES_Consulta @Cod_Conductor='', @Nom_Conductor='', @Estatus='', @Cod_Plaza=''";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "conductores.getAllByPlazaAndCode": async (plaza, code, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        SELECT COD_USUARIO CODIGO,NOM_USUARIO NOMBRE FROM CONSUMOS_PASSA..CATUSUARIOS Where COD_PLAZA='${plaza}' ${
        code ? "AND COD_USUARIO='${code}'" : ""
      }
      `;

      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "conductores.insert": async (datos, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [SP_CAT_CONDUCTORES] @Cod_Conductor='0', @Nom_Conductor='${
          datos.nombre
        }', @Estatus='${datos.estatus ? "A" : "B"}', @Cod_Plaza='${datos.plaza}'
      `;

      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: [],
        message: "ha ocurrido un error",
      };
    }
  },
  "conductores.update": async (datos, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [SP_CAT_CONDUCTORES] @Cod_Conductor='${
          datos.codigo
        }', @Nom_Conductor='${datos.nombre}', @Estatus='${
        datos.estatus ? "A" : "B"
      }', @Cod_Plaza='${datos.plaza}'
      `;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: [],
        message: "ha ocurrido un error",
      };
    }
  },
});
