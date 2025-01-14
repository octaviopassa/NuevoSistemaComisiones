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
    WHERE ESTATUS= 'A' ${datos.cod_usu ? `AND COD_USU='${datos.cod_usu}'` : ""}
    `;
    conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;
    conexiones.body_bdseleccionada.servidor = datos.servidor;

    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "tipoGastos.getAll": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query =
        "SELECT CODIGO_GASTO Codigo, NOMBRE_GASTO Nombre FROM CONSUMOS_PASSA..CAT_GASTOS ORDER BY NOMBRE_GASTO";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      const respuesta = JSON.parse(response.data.data.resultado);

      return respuesta;
    } catch (e) {
      console.log(e);
    }
  },
  "gastos.getFolioProvisional": async (data) => {
    try {      
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query = `exec MP_GENERA_FOLIO_SELECT @COD_DOC='GT', @MODULO='G', @PLAZA='${data.plaza}'`;
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });
      const respuesta = JSON.parse(response.data.data.resultado);
      
      return respuesta;
    } catch (e) {
      console.log(e);
    }
  },
  "gastos.isAuthorized": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = data.baseDatos;
      conexiones.body_bdseleccionada.query = `select DBO.VALIDA_DOCUMENTO_POR_USUARIO_PLAZA('${data.user}','GT','G','${data.plaza}')`;
      conexiones.body_bdseleccionada.servidor = data.servidor;
     
      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (!response.data.data.esValido) {
        throw new Error(response.data.data.mensaje);
      }

      const result = JSON.parse(response.data.data.resultado)
     
      return {
        isValid: response.data.data.esValido,
        data: result[0]?.Column1 ? true : false,
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
  "gastos.grabar": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
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
        @PAGAR_A='${datos.pagarA}',
        @ISH=${datos.ish},
        @TUA=${datos.tua},
        @OBSERVACION='${datos.observaciones}',
        @ACCION='INSERTAR',
        ${datos.proyecto ? `@CODIGO_PROYECTO='${datos.proyecto}',` : ""}
        @EsWeb=1,
        @RFC_RECEPTOR='${datos.rfc}'
      `;
      conexiones.body_bdseleccionada.servidor = datos.servidor;

      // console.log("SISTEMAS GRABAR GASTO", conexiones.body_bdseleccionada.query);

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
  "gastos.grabarRenglon": async (datos) => {
    try {
      let cadena_xml = datos.cadena_xml
        ? Buffer.from(datos.cadena_xml, "base64").toString("utf-8")
        : "";

      cadena_xml = cadena_xml.replace(/<\?xml.*?\?>\s*/g, '').trim();

      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [MP_GRABA_GASTO_DETALLE]
        @ID_GASTO_DETALLE=0,
        @FOLIO_GASTO='${datos.folio}',
        @TIPO_DOCUMENTO='${datos.tipoDocumento}',
        @CODIGO_PROVEEDOR=${datos.proveedor},
        @CODIGO_GASTO=${datos.tipoGasto},
        @CONCEPTO='${datos.concepto}',
        @FECHA='${datos.fecha}',
        @FOLIO_PROVEEDOR='${datos.folioProveedor}',
        @SUBTOTAL=${datos.subtotal},
        @IVA=${datos.iva},
        @IVA_16=${datos.iva_16},
        @IVA_8=${datos.iva_8},
        @IEPS=${datos.ieps},
        @RETENCION=${datos.retencion},
        @TOTAL=${datos.total},
        @CCON='',
        @ID_MANTENIMIENTO_GLOBAL=0,
        @RECIBIDO='0',
        @ISH=${datos.ish},
        @CADENA_XML='${cadena_xml}',
        @UUID='${datos.uuid}',
        @TUA=${datos.tua},
        @TIENE_TUA_DESGLOSADO='${datos.tua_desglosado}',
        @CLIENTE='${datos.cliente}',
        @ROWUID_PDF_EN_SERVIBOX=''
      `;
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
    } catch (e) {
      console.log(e);
      return {
        isValid: false,
        data: null,
        message: e.message,
      };
    }
  },
  "gastos.grabarGastoCombustible": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [MP_CONSUMOS_VALE_COMBUSTIBLE_GRABA] 
        @IDVALE=0,
        @FOLIO='${datos.folio}',
        @FECHA='${datos.fecha}',
        @CODIGO_VEHICULO='${datos.vehiculo}',
        @CODIGO_ENCARGADO='${datos.conductor}',
        @IMPORTE=${datos.importe},
        @LITROS=${datos.litros},
        @KM=${datos.km},
        @TIPO_COMBUSTIBLE=${datos.combustible},
        @CODIGO_USUARIO_GRABO='${datos.cod_usu}',
        @CODIGO_GASOLINERA=${datos.gasolinera},
        @COD_PLAZA='${datos.plaza}',
        @FOLIO_GASTO='${datos.folioGasto}',
        @ACCION='INSERTAR'
      `;
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
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (e) {
      console.log(e);
    }
  },
  "gastos.consultar": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec dbo.[MP_GASTOS_CONSULTAS] 
        @PLAZA=N'${datos.plaza}',
        @FECHA1=${datos.fechaInicio ? `'${datos.fechaInicio}'` : null},
        @FECHA2=${datos.fechaFin ? `'${datos.fechaFin}'` : null},
        @ESTATUS='${datos.estatus}',
        @CODIGO_VENDEDOR='${datos.vendedor}',
        @Cod_Usuario='${datos.cod_usu}'
      `;
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
  "gastos.getProyectos": async (servidor) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query =
        "SELECT CODIGO_PROYECTO CODIGO,NOMBRE_PROYECTO NOMBRE FROM IANSA..CAT_PROYECTOS ORDER BY CODIGO_PROYECTO DESC";
      conexiones.body_bdseleccionada.servidor = servidor;

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
