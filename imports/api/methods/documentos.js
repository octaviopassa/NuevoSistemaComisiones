import conexiones from "../../utils/config";
import axios from "axios";
import { limpiarBase64XML, limpiarCadenaXML } from "../../utils/utils";

Meteor.methods({
  "documentos.grabarArchivoXML": async (datos) => {
    try {
      //Limpiamos el archivo para eliminar los caracteres no validos
      let archivoXML = limpiarBase64XML(datos.archivo);

      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `dbo.MP_XML_GRABA_ARCHIVO`;
      conexiones.body_bdseleccionada.servidor = datos.servidor;
      conexiones.body_bdseleccionada.parametros = [
        {
          parametro: "@ID_GASTO_DETALLE",
          valor: `${datos.id_renglon}`,
          tipo: "entero",
          direccion: "entrada",
        },
        {
          parametro: "@NOMBRE_XML",
          valor: datos.nombre_xml,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO",
          valor: archivoXML || "",
          tipo: archivoXML ? "base64ToImagen" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@COD_USU_AGREGO",
          valor: datos.cod_usu,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@OPERACION",
          valor: "Agregar",
          tipo: "cadena",
          direccion: "entrada",
        },
      ];

      const response = await axios.post(
        conexiones.windows_api_post,
        conexiones.body_bdseleccionada,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "documentos.grabarArchivoPDF": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `MP_GASTOS_GRABA_ARCHIVO_NOTA`;
      conexiones.body_bdseleccionada.servidor = datos.servidor;
      conexiones.body_bdseleccionada.parametros = [
        {
          parametro: "@ID_GASTO_DETALLE",
          valor: `${datos.id_renglon}`,
          tipo: "entero",
          direccion: "entrada",
        },
        {
          parametro: "@NOMBRE_ARCHIVO",
          valor: datos.nombre_pdf,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO",
          valor: datos.archivo || "",
          tipo: datos.archivo ? "base64ToImagen" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@COD_USU_AGREGO",
          valor: datos.cod_usu,
          tipo: "cadena",
          direccion: "entrada",
        },
      ];

      const response = await axios.post(
        conexiones.windows_api_post,
        conexiones.body_bdseleccionada,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "documentos.grabarArchivo": async (datos) => {
    try {
      let cadena_xml = datos.cadena_xml
        ? limpiarCadenaXML(Buffer.from(datos.cadena_xml, "base64").toString("utf-8"))
        : "";
      //Limpiamos el archivo para eliminar los caracteres no validos
      let archivoXML = limpiarBase64XML(datos.archivo);

      // cadena_xml = cadena_xml.replace(/<\?xml.*?\?>\s*/g, '').replace(/'/g, '').trim();      

      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `dbo.MP_GASTOS_SUBIR_XML_PDF`;
      conexiones.body_bdseleccionada.servidor = datos.servidor;
      conexiones.body_bdseleccionada.parametros = [
        {
          parametro: "@FOLIO_GASTO",
          valor: datos.folio,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO_XML",
          valor: archivoXML || "",
          tipo: archivoXML ? "base64ToImagen" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO_PDF",
          valor: datos.archivo_pdf || "",
          tipo: datos.archivo_pdf ? "base64ToImagen" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@CADENA_XML",
          valor: cadena_xml,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@COD_USU_VALIDACION",
          valor: datos.cod_usu,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@IDORIGEN_GRUPO",
          valor: "6",
          tipo: "entero",
          direccion: "entrada",
        },
      ];

      const response = await axios.post(
        conexiones.windows_api_post,
        conexiones.body_bdseleccionada,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.data.esValido) {
        return {
          isValid: response.data.data.esValido,
          data: null,
          message: response.data.data.mensaje,
        };
      }

      return {
        isValid: response.data.data.esValido,
        data: JSON.parse(response.data.data.resultado) || null,
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
  "documentos.grabarArchivoNota": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `dbo.MP_GASTOS_GRABA_ARCHIVO_NOTA`;
      conexiones.body_bdseleccionada.servidor = datos.servidor;
      conexiones.body_bdseleccionada.parametros = [
        {
          parametro: "@ID_GASTO_DETALLE",
          valor: `${datos.id_renglon}`,
          tipo: "entero",
          direccion: "entrada",
        },
        {
          parametro: "@NOMBRE_ARCHIVO",
          valor: datos.nombre_pdf,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO",
          valor: datos.archivo || "",
          tipo: datos.archivo ? "base64ToImagen" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@COD_USU_AGREGO",
          valor: datos.cod_usu,
          tipo: "cadena",
          direccion: "entrada",
        },
      ];

      const response = await axios.post(
        conexiones.windows_api_post,
        conexiones.body_bdseleccionada,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "documentos.eliminarXML": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.servidor = datos.servidor;
      conexiones.body_bdseleccionada.query = `
              exec dbo.MP_GASTOS_INSERTAR_RENGLON_ELIMINADO
              @UUID=NULL,
              @ID_Gasto_Detalle='${datos.id}'
            `;

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
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "documentos.getGastoGlobal": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC DBO.MP_CONSULTA_WEB_REACT_GASTOS_GLOBAL 
              @FOLIO_GASTO='${data.folio}',
              @PLAZA='${data.plaza}', 
              @COD_USUARIO='${data.cod_usu}' 
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.getGastosDetalle": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC DBO.MP_CONSULTA_WEB_REACT_GASTOS_DETALLE 
              @FOLIO_GASTO='${data.folio}'
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
  "documentos.getResumen": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC MP_CONSULTA_WEB_REACT_OBTIENE_RESUMEN
              @FOLIO_GASTO='${data.folio}'
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.autorizarGasto": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_AUTORIZA_GASTO_GLOBAL 
              @FOLIO_GASTO='${data.folio}',
              @COD_USU='${data.cod_usu}' 
            `;

      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.desautorizarGasto": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_DESAUTORIZA_GASTO_GLOBAL 
              @FOLIO_GASTO='${data.folio}'
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.cancelarGasto": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_CANCELA_GASTO
              @FOLIO_GASTO='${data.folio}', 
              @COD_USU='${data.cod_usu}' 
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.descartarDetalle": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_GASTOS_DESCARTA_GASTO_WEB 
              @FOLIO_GASTO='${data.folio}',
              @PLAZA='${data.plaza}', 
              @ID_GASTO_DETALLE=${data.detalleId}, 
              @COD_USU='${data.cod_usu}', 
              @DESCARTADO='DESCARTADO' 
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.habilitarDetalleDescartado": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_GASTOS_DESCARTA_GASTO_WEB 
              @FOLIO_GASTO='${data.folio}',
              @PLAZA='${data.plaza}', 
              @ID_GASTO_DETALLE=${data.detalleId}, 
              @COD_USU='${data.cod_usu}', 
              @DESCARTADO='' 
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

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
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.validarXml": async (data) => {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
    conexiones.body_bdseleccionada.servidor = data.servidor;

    const queryGlobal = `
      MP_VALIDA_XML_EXISTE_UUID_EXPEDIENTES 
      @UUID='${data.uuid}'
    `;

    const queryResumen = `
      MP_VALIDA_XML_EXISTE_UUID
      @UUID='${data.uuid}'
    `;

    try {
      const [responseExpedientes, responseExiste] = await Promise.all([
        axios.get(conexiones.windows_api, {
          data: {
            ...conexiones.body_bdseleccionada,
            query: queryGlobal,
          },
        }),
        axios.get(conexiones.windows_api, {
          data: {
            ...conexiones.body_bdseleccionada,
            query: queryResumen,
          },
        }),
      ]);

      if (
        !responseExpedientes.data.data.esValido ||
        !responseExiste.data.data.esValido
      ) {
        return {
          isValid:
            responseExpedientes.data.data.esValido &&
            responseExiste.data.data.esValido,
          data: null,
          message: `${responseExpedientes.data.data.mensaje} 
           ${responseExiste.data.data.mensaje}`,
        };
      }

      const existeExpedientes = JSON.parse(
        responseExpedientes.data.data.resultado
      );
      const existe = JSON.parse(responseExiste.data.data.resultado);

      return {
        isValid:
          responseExpedientes.data.data.esValido &&
          responseExiste.data.data.esValido,
        data: {
          existeExpedientes,
          existe,
        },
        message: `${responseExpedientes.data.data.mensaje} 
         ${responseExiste.data.data.mensaje}`,
      };
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.getXml": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "CONSUMOS_PASSA";
      // conexiones.body_bdseleccionada.query = `SELECT
      //           'XML_FOLIO_'+ISNULL(FOLIO,'SIN_FOLIO')+'UUID'+UUID+'.XML' Nombre,
      //           CAST('' AS XML).value('xs:base64Binary(sql:column("ARCHIVO_XML"))', 'NVARCHAR(MAX)') ARCHIVO_XML
      //         FROM XMLS_PASSA
      //         WHERE IDXML=${data.id}
      //       `;
      conexiones.body_bdseleccionada.query = `
              exec MP_CONSULTA_WEB_REACT_ARCHIVO_XML_PDF               
              @ID_GASTO_DETALLE=${data.id},
              @TIPO_ARCHIVO='XML'
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (!response.data.data.esValido) {
        throw new Error(response.data.data.mensaje);
      }

      return {
        isValid: response.data.data.esValido,
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
  "documentos.getPDF": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "CONSUMOS_PASSA";
      // conexiones.body_bdseleccionada.query = `SELECT
      //             'PDF_FOLIO_'+ISNULL(FOLIO,'SIN_FOLIO')+'UUID'+UUID+'.PDF' Nombre,
      //             CAST('' AS XML).value('xs:base64Binary(sql:column("ARCHIVO_PDF"))', 'NVARCHAR(MAX)') ARCHIVO_PDF
      //           FROM XMLS_PASSA
      //           WHERE IDXML=${data.id}
      //     `;
      conexiones.body_bdseleccionada.query = `
              exec MP_CONSULTA_WEB_REACT_ARCHIVO_XML_PDF               
              @ID_GASTO_DETALLE=${data.id},
              @TIPO_ARCHIVO='PDF'
            `;
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (!response.data.data.esValido) {
        throw new Error(response.data.data.mensaje);
      }

      return {
        isValid: response.data.data.esValido,
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
  "documentos.grabarArchivoComisiones": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `dbo.MP_COMISIONES_TIPOS_DOCUMENTOS_EXPEDIENTES_GRABAR`;
      conexiones.body_bdseleccionada.servidor = datos.servidor;
      conexiones.body_bdseleccionada.parametros = [
        {
          parametro: "@FOLIO_GASTO",
          valor: `${datos.id_renglon}`,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@CODIGO_TIPO_DOCUMENTO",
          valor: `${datos.id_renglon}`,
          tipo: "entero",
          direccion: "entrada",
        },
        {
          parametro: "@NOMBRE_ARCHIVO",
          valor: datos.nombre_pdf,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO",
          valor: datos.archivo || "",
          tipo: datos.archivo ? "base64ToImagen" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@COD_USU_AGREGO",
          valor: datos.cod_usu,
          tipo: "cadena",
          direccion: "entrada",
        },
      ];

      const response = await axios.post(
        conexiones.windows_api_post,
        conexiones.body_bdseleccionada,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

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
    } catch (error) {
      console.log(error);
      return {
        isValid: false,
        data: null,
        message: error.message,
      };
    }
  },
});
