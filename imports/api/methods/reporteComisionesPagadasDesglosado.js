import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "reporteComisionesPagadasDesglosado.consultar": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "CONSUMOS_PASSA";
      conexiones.body_bdseleccionada.query = `
        exec dbo.[MP_RPT_GASTOS_INDICADOR_COMISIONES_ANUAL_POR_MESES_DESGLOSADO]
        @PLAZA='${datos.plaza}', 
        @CODIGO_REPRESENTANTE='${datos.codigoRepresentante}',        
        @FECHA1=${datos.fecha1_Comision ? `'${datos.fecha1_Comision}'` : null},
        @FECHA2=${datos.fecha2_Comision ? `'${datos.fecha2_Comision}'` : null},
        @COD_CTE='${datos.codigoCliente}'`;
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (!response.data.data.esValido) {
        return {
          isValid: response.data.data.esValido,
          data: null,
          message: response.data.data.mensaje,
        };
      }

      return {
        isValid: response.data.data.esValido,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (e) {
      console.log(e);
    }
  },
});
