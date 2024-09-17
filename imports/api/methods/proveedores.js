import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "proveedores.getAllWithName": async (datos) => {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.query =
      "Exec MP_Consulta_Proveedores_Nombre_RFC @Texto_Buscar ='" +
      datos.search +
      "'";
    conexiones.body_bdseleccionada.baseDatos = "consumos_passa";

    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "proveedores.getAll": async () => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query =
        "exec SP_CAT_PROVEEDORES_Consulta @Cod_Proveedor=''";

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      const result = JSON.parse(response.data.data.resultado);

      const formattedResult = result.map(
        ({
          Cod_Proveedor: codigo,
          Nom_Proveedor: nombre,
          RFC: rfc,
          Nom_Estatus: estatus,
        }) => ({
          codigo,
          nombre,
          rfc,
          estatus,
        })
      );

      return formattedResult;
    } catch (error) {
      console.log(error);
    }
  },
  "proveedores.insert": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [SP_CAT_PROVEEDORES] 
        @Cod_Proveedor='0', 
        @Nom_Proveedor='${datos.nombre}',
        @RFC='${datos.rfc}',
        @Estatus='${datos.estatus ? "Activo" : "Inactivo"}',
        @COD_USUARIO_GRABO='${datos.cod_usu}'
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
  "proveedores.update": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
        exec [SP_CAT_PROVEEDORES] 
        @Cod_Proveedor='${datos.codigo}',
        @Nom_Proveedor='${datos.nombre}',
        @RFC='${datos.rfc}',
        @Estatus='${datos.estatus ? "Activo" : "Inactivo"}',
        @COD_USUARIO_GRABO='${datos.cod_usu}'
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
