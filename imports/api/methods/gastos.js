import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "gastos.pagarA": async (datos) => {
    conexiones.body_bdseleccionada.tipo = "consulta";
    conexiones.body_bdseleccionada.query = `SELECT 
      ID_CUENTA_DESTINO Codigo, 
      NOMBRE_CUENTA_DESTINO  Nombre, 
      NOMBRE_COMPLETO, 
      APELLIDOS,
      NUMERO,
      TIPO,
      BANCO,
      ESTATUS,
      RFC,
      CURP
    FROM CONSUMOS_PASSA..CAT_CUENTAS_DESTINO 
    WHERE ESTATUS= 'A' AND cod_usu='${datos.cod_usu}'
    `;
    conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;

    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "tipoGastos.getAll": async () => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query =
        "SELECT CODIGO_GASTO Codigo, NOMBRE_GASTO Nombre FROM CONSUMOS_PASSA..CAT_GASTOS ORDER BY NOMBRE_GASTO";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      const respuesta = JSON.parse(response.data.data.resultado);

      return respuesta;
    } catch (e) {
      console.log(e);
    }
  },
  "gastos.getFolioProvisional": async (plaza) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec MP_GENERA_FOLIO_SELECT @COD_DOC='GT', @MODULO='G', @PLAZA='${plaza}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      const respuesta = JSON.parse(response.data.data.resultado);

      return respuesta;
    } catch (e) {
      console.log(e);
    }
  },
});
