import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "reporteDepositos.consultar": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "fabrica_passa";
      conexiones.body_bdseleccionada.query = `
        exec dbo.[MP_RPT_CXC_DETALLE_DEPOSITOS_POR_DETALLE_VENTAS_WEB]
        @COD_CTE='', 
        @CODIGO_REPRESENTANTE=${datos.codigoRepresentante},        
        @FECHA1=${datos.fecha1_Comision ? `'${datos.fecha1_Comision}'` : null},
        @FECHA2=${datos.fecha2_Comision ? `'${datos.fecha2_Comision}'` : null},
        @STATUS='A',
        @CTA_BANCARIA='',
        @PLAZA='01',
        @COD_ZONA='',
        @FILTRAR_POR_PTAJE_UTILIDAD_MINIMA='1',
        @PTAJE_UTILIDAD_MINIMA='50'`;
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
