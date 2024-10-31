import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "gasolineras.getAll": async (plaza, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec dbo.SP_Cat_Gasolineras_Consulta @Cod_Gasolinera='', @Nom_Gasolinera='', @Estatus='', @Cod_Plaza='${plaza}'`;
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
  "gasolineras.insert": async (data, baseDatos) => {
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
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

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
  "gasolineras.update": async (data, baseDatos) => {
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
    } catch (e) {
      console.log(e);
    }
  },
});

/**
 exec [MP_CATALOGOS_GASOLINERAS_GRABA] 
  @Codigo_Gasolinera='0',
  @Nombre_Gasolinera='prueba',
  @Estatus='A',
  @Cod_Plaza='01',
  @Accion='Insertar'
 */
