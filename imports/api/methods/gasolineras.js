import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "gasolineras.getAll": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec dbo.SP_Cat_Gasolineras_Consulta @Cod_Gasolinera='', @Nom_Gasolinera='', @Estatus='', @Cod_Plaza='${data.plaza}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "gasolineras.insert": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [MP_CATALOGOS_GASOLINERAS_GRABA] 
        @Codigo_Gasolinera='0', 
        @Nombre_Gasolinera='${data.nombre}', 
        @Estatus='${data.estatus ? "A" : "B"}', 
        @Cod_Plaza='${data.plaza}',
        @Accion='Insertar'
      `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      console.log(response);

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (e) {
      console.log(e);
    }
  },
  "gasolineras.update": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [MP_CATALOGOS_GASOLINERAS_GRABA] 
        @Codigo_Gasolinera='${data.codigo}', 
        @Nombre_Gasolinera='${data.nombre}', 
        @Estatus='${data.estatus ? "A" : "B"}', 
        @Cod_Plaza='${data.plaza}',
        @Accion='Actualizar'
      `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (e) {
      console.log(e);
    }
  },
});