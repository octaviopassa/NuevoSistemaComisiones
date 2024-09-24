import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "documentos.grabarArchivoXML": async (datos, accion = "Agregar") => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `
            exec [MP_XML_GRABA_ARCHIVO]
            @ID_GASTO_DETALLE=${datos.id_renglon},
            @NOMBRE_XML='${datos.nombre_xml}',
            @ARCHIVO=${datos.archivo},
            @COD_USU_AGREGO='${datos.cod_usu}',
            @OPERACION='${accion}'
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
  "documentos.grabarArchivoPDF": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "expedientes";
      conexiones.body_bdseleccionada.query = `
              exec [MP_GASTOS_GRABA_ARCHIVO_NOTA]
              @ID_GASTO_DETALLE=${datos.id_renglon},
              @NOMBRE_ARCHIVO='${datos.nombre_pdf}',
              @ARCHIVO=${datos.archivo},
              @COD_USU_AGREGO='${datos.cod_usu}'
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

      return {
        isValid: response.data.isValid,
        data: JSON.parse(response.data.data.resultado),
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
              @ARCHIVO=${datos.archivo},
              @COD_USU_AGREGO='${datos.cod_usu}'
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
