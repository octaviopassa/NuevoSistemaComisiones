import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "documentos.grabarArchivoXML": async (datos, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `dbo.MP_XML_GRABA_ARCHIVO`;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );
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
          valor: datos.archivo || "",
          tipo: datos.archivo ? "base64" : "cadena",
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
    }
  },
  "documentos.grabarArchivoPDF": async (datos, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `MP_GASTOS_GRABA_ARCHIVO_NOTA`;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );
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
          tipo: datos.archivo ? "base64" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@COD_USU_AGREGO",
          valor: datos.cod_usu,
          tipo: "cadena",
          direccion: "entrada",
        },
      ];
      console.log(conexiones.body_bdseleccionada);
      const response = await axios.post(
        conexiones.windows_api_post,
        conexiones.body_bdseleccionada,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response);

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
  "documentos.grabarArchivo": async (datos, baseDatos) => {
    try {
      const cadena_xml = datos.cadena_xml
        ? Buffer.from(datos.cadena_xml, "base64").toString("utf-8")
        : "";
      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `dbo.MP_GASTOS_SUBIR_XML_PDF`;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );
      conexiones.body_bdseleccionada.parametros = [
        {
          parametro: "@FOLIO_GASTO",
          valor: datos.folio,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO_XML",
          valor: datos.archivo_xml || "",
          tipo: datos.archivo_xml ? "base64" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO_PDF",
          valor: datos.archivo_pdf || "",
          tipo: datos.archivo_pdf ? "base64" : "cadena",
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
      console.log(conexiones.body_bdseleccionada);
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
    }
  },
  "documentos.grabarArchivoNota": async (datos, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimientoAlmacenado";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `dbo.MP_GASTOS_GRABA_ARCHIVO_NOTA`;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );
      conexiones.body_bdseleccionada.parametros = [
        {
          parametro: "@ID_GASTO_DETALLE",
          valor: `${datos.id_renglon}`,
          tipo: "entero",
          direccion: "entrada",
        },
        {
          parametro: "@NOMBRE_ARCHIVO",
          valor: datos.nombre_xml,
          tipo: "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@ARCHIVO",
          valor: datos.archivo || "",
          tipo: datos.archivo ? "base64" : "cadena",
          direccion: "entrada",
        },
        {
          parametro: "@COD_USU_AGREGO",
          valor: datos.cod_usu,
          tipo: "cadena",
          direccion: "entrada",
        },
      ];
      console.log(conexiones.body_bdseleccionada);
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
    }
  },
  "documentos.eliminarXML": async (id, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );
      conexiones.body_bdseleccionada.query = `
              exec dbo.MP_GASTOS_INSERTAR_RENGLON_ELIMINADO
              @UUID='null',
              @ID_Gasto_Detalle='${id}'
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
    }
  },
  "documentos.getGastoGlobal": async (data, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC DBO.MP_CONSULTA_WEB_REACT_GASTOS_GLOBAL 
              @FOLIO_GASTO='${data.folio}',
              @PLAZA='${data.plaza}', 
              @COD_USUARIO='${data.cod_usu}' 
            `;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

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
  "documentos.getGastosDetalle": async (folio, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC DBO.MP_CONSULTA_WEB_REACT_GASTOS_DETALLE 
              @FOLIO_GASTO='${folio}'
            `;

      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

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
      console.log(JSON.parse(response.data.data.resultado));

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
        message: response.data.data.mensaje,
      };
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.getResumen": async (folio, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC MP_CONSULTA_WEB_REACT_OBTIENE_RESUMEN
              @FOLIO_GASTO='${folio}'
            `;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

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
  "documentos.autorizarGasto": async (data, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_AUTORIZA_GASTO_GLOBAL 
              @FOLIO_GASTO='${data.folio}',
              @COD_USU='${data.cod_usu}' 
            `;

      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

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
  "documentos.desautorizarGasto": async (data, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_DESAUTORIZA_GASTO_GLOBAL 
              @FOLIO_GASTO='${data.folio}'
            `;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

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
  "documentos.cancelarGasto": async (data, baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_CANCELA_GASTO
              @FOLIO_GASTO='${data.folio}', 
              @COD_USU='${data.cod_usu}' 
            `;
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

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
  "documentos.descartarDetalle": async (data, baseDatos) => {
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
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      console.log(response.data);

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
  "documentos.habilitarDetalleDescartado": async (data, baseDatos) => {
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
      const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
      conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
        ip,
        baseDatos
      );

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      console.log(response.data);

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
  "documentos.validarXml": async (uuid, baseDatos) => {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
    const [ip, _] = conexiones.body_bdseleccionada.servidor.split("\\");
    conexiones.body_bdseleccionada.servidor = conexiones.getInstancia(
      ip,
      baseDatos
    );

    const queryGlobal = `
      MP_VALIDA_XML_EXISTE_UUID_EXPEDIENTES 
      @UUID='${uuid}'
    `;

    const queryResumen = `
      MP_VALIDA_XML_EXISTE_UUID
      @UUID='${uuid}'
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
});
