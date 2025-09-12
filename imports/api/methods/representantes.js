import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "representantes.getAll": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec MP_WEB_REACT_CAT_REPRESENTANTES_CONSULTAR @Plaza= '${datos.plaza}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (error) {
      console.log(error);
      return error;
    }
  },
  "representantes.grabar": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `
    exec MP_CAT_REPRESENTANTES_GRABAR
      @ACCION='${datos.accion}',
      @CODIGO_REPRESENTANTE=${datos.codigo_representante === "#" ? 0 : datos.codigo_representante},
      @NOMBRE_REPRESENTANTE='${datos.nombre_representante}',
      @ESTATUS='${datos.estatus ? "A" : "B"}',
      @PTJE_COMISION=${datos.porcentaje_comision},
      @COD_ZONA='${datos.cod_zona}',
      @OBSERVACIONES='${datos.observaciones}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (!response.data.data.esValido) {
        throw new Meteor.Error("error", response.data.data.mensaje);
      }

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "representantes.grabarClienteRelacionado": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec MP_CAT_REPRESENTANTES_GRABAR_RELACION_CLIENTE
      @CODIGO_REPRESENTANTE=${datos.codigoRepresentante},
      @COD_CTE='${datos.codigoCliente}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (!response.data.data.esValido) {
        throw new Meteor.Error("error", response.data.data.mensaje);
      }

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "representantes.eliminarClienteRelacionado": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec MP_CAT_REPRESENTANTES_ELIMINAR_RELACION_CLIENTE
      @CODIGO_REPRESENTANTE=${datos.codigoRepresentante},
      @COD_CTE='${datos.codigoCliente}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (!response.data.data.esValido) {
        throw new Meteor.Error("error", response.data.data.mensaje);
      }

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "representantes.getClientesRelacionados": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec MP_WEB_REACT_CAT_REPRESENTANTES_REL_CLIENTES_CONSULTAR @CODIGO_REPRESENTANTE=${datos.codigoRepresentante}`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (error) {
      console.log(error);
      return error;
    }
  },
});