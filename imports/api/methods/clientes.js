import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "clientes.getAll": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `EXEC MP_CAT_CLIENTES_CONSULTA @CODIGO_CLIENTE=''`;
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "clientes.getAllByName": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `Exec MP_Consulta_Clientes_Nombre_RFC @Texto_Buscar ='${datos.search}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "clientes.clientesVisible": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `SELECT MOSTRAR_COLUMNA_CLIENTES FROM empresas..CAT_DB_EMPRESAS WHERE BASE_DATOS='${datos.baseDatos}'`;
      conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      const respuesta = JSON.parse(response.data.data.resultado);

      return respuesta[0].MOSTRAR_COLUMNA_CLIENTES;
    } catch (e) {
      console.log(e);
    }
  },
  "clientes.insert": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec MP_CAT_CLIENTES_GRABAR 
        @COD_CLIENTE='0',
        @NOM_CLIENTE='${datos.nombre}',
        @Estatus='${datos.estatus ? "A" : "B"}',
        @RFC='${datos.rfc}',
        @COD_USUARIO_GRABO='${datos.cod_usu}',
        @ACCION='INSERTAR'
      `;
      conexiones.body_bdseleccionada.servidor = datos.servidor;

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
    }
  },
  "clientes.update": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec MP_CAT_CLIENTES_GRABAR 
        @COD_CLIENTE='${datos.codigo}',
        @NOM_CLIENTE='${datos.nombre}',
        @Estatus='${datos.estatus ? "A" : "B"}',
        @RFC='${datos.rfc}',
        @COD_USUARIO_GRABO='${datos.cod_usu}',
        @ACCION='ACTUALIZAR'
      `;
      conexiones.body_bdseleccionada.servidor = datos.servidor;

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
    }
  },
});
