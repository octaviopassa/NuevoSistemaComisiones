import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "documentos.grabarArchivoXML": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `
            exec [MP_XML_GRABA_ARCHIVO]
            @ID_GASTO_DETALLE=${datos.id_renglon},
            @NOMBRE_XML='${datos.nombre_xml}',
            @ARCHIVO='${datos.archivo}',
            @COD_USU_AGREGO='${datos.cod_usu}',
            @OPERACION='Agregar'
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
  "documentos.grabarArchivoPDF": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `
              exec [MP_GASTOS_GRABA_ARCHIVO_NOTA]
              @ID_GASTO_DETALLE=${datos.id_renglon},
              @NOMBRE_ARCHIVO='${datos.nombre_pdf}',
              @ARCHIVO='${datos.archivo}',
              @COD_USU_AGREGO='${datos.cod_usu}'
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
  "documentos.grabarArchivo": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `
            exec dbo.MP_GASTOS_SUBIR_XML_PDF
            @FOLIO_GASTO='${datos.folio}',
            @ARCHIVO_XML='${datos.archivo_xml}',
            @ARCHIVO_PDF='${datos.archivo_pdf}',
            @CADENA_XML='${datos.cadena_xml}',
            @COD_USU_VALIDACION='${datos.cod_usu}',
            @IDORIGEN_GRUPO=6
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
        isValid: response.data.data.esValido,
        data: JSON.parse(response.data.data.resultado) || null,
        message: response.data.data.mensaje,
      };
    } catch (error) {
      console.log(error);
    }
  },
  "documentos.grabarArchivoNota": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `
              exec [MP_GASTOS_GRABA_ARCHIVO_NOTA]
              @ID_GASTO_DETALLE=${datos.id_renglon},
              @NOMBRE_ARCHIVO='${datos.nombre_xml}',
              @ARCHIVO='${datos.archivo}',
              @COD_USU_AGREGO='${datos.cod_usu}'
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
  "documentos.eliminarXML": async (id) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
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
  "documentos.getGastosDetalle": async (folio) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC DBO.MP_CONSULTA_WEB_REACT_GASTOS_DETALLE 
              @FOLIO_GASTO='${folio}'
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
  "documentos.getResumen": async (folio) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              EXEC MP_CONSULTA_WEB_REACT_OBTIENE_RESUMEN
              @FOLIO_GASTO='${folio}'
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
  "documentos.autorizarGasto": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
              exec MP_AUTORIZA_GASTO_GLOBAL 
              @FOLIO_GASTO='${data.folio}',
              @COD_USU='${data.cod_usu}' 
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
});
