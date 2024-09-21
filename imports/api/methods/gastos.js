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
  "gastos.grabar": async (datos, accion = "INSERTAR") => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      // TODO: Poner el RFC correcto.
      conexiones.body_bdseleccionada.query = `
        exec dbo.MP_GRABA_GASTO_GLOBAL
        @FOLIO_GASTO='${datos.folio}',
        @PLAZA='${datos.plaza}',
        @FECHA='${datos.fecha}',
        @COD_USU='${datos.cod_usu}',
        @SUBTOTAL=${datos.subtotal},
        @IVA=${datos.iva},
        @IVA_16=${datos.iva_16},
        @IVA_8=${datos.iva_8},
        @IEPS=${datos.ieps},
        @RETENCION=${datos.retencion},
        @TOTAL=${datos.total},
        @ORIGEN='${datos.origen}',
        @CODIGO_VENDEDOR='${datos.ingeniero}',
        @PAGAR_A='${datos.pagar_a}',
        @ISH=${datos.ish},
        @TUA=${datos.tua},
        @OBSERVACIONES='${datos.observaciones}'
        @ACCION='${accion}',
        @EsWeb=1,
        @RFC_RECEPTOR='NFPP170927MHA'
      `;

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