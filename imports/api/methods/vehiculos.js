import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "vehiculos.getAll": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query =
        "exec dbo.SP_Cat_Vehiculos_Consulta @CODIGO_VEHICULO=0, @NOMBRE_VEHICULO='', @PLACA='', @MODELO='', @NUMERO_SERIE='', @POLIZA_SEGURO='', @CODIGO_ENCARGADO=0, @COD_ZONA='', @ESTATUS=' ', @ES_VEHICULO_OFICIAL='0', @CODIGO_VEHICULO_OFICIAL=0, @Plaza='" +
        datos.plaza +
        "'";
      datos.plaza + "'";
      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "vehiculos.insert": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
            exec [MP_CATALOGOS_VEHICULOS_GRABA] 
            @CODIGO_VEHICULO=0,
            @NOMBRE_VEHICULO='${datos.nombre}', 
            @PLACA='${datos.placa}', 
            @MODELO='${datos.modelo}',
            @NUMERO_SERIE='${datos.serie || ""}',
            @POLIZA_SEGURO='${datos.poliza || ""}', 
            @CODIGO_ENCARGADO=${Number(datos.conductor)},
            @COD_ZONA='${datos.plaza}', 
            @ESTATUS='${datos.estatus ? "A" : "B"}',
            @ES_VEHICULO_OFICIAL='0', 
            @CODIGO_VEHICULO_OFICIAL='0', 
            @Accion='Insertar'
        `;

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
  "vehiculos.update": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
            exec [MP_CATALOGOS_VEHICULOS_GRABA] 
            @CODIGO_VEHICULO=${Number(datos.codigo)},
            @NOMBRE_VEHICULO='${datos.nombre}', 
            @PLACA='${datos.placa}', 
            @MODELO='${datos.modelo}',
            @NUMERO_SERIE='${datos.serie || ""}',
            @POLIZA_SEGURO='${datos.poliza || ""}', 
            @CODIGO_ENCARGADO=${Number(datos.conductor)},
            @COD_ZONA='${datos.plaza}', 
            @ESTATUS='${datos.estatus ? "A" : "B"}',
            @ES_VEHICULO_OFICIAL='0', 
            @CODIGO_VEHICULO_OFICIAL='0', 
            @Accion='Actualizar'
        `;

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
