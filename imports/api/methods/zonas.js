import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "zonas.getAll": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.baseDatos = data.baseDatos;
      conexiones.body_bdseleccionada.query = `select COD_ZONA,NOM_ZONA from CATZONAS WHERE ESTATUS='A'`;
      conexiones.body_bdseleccionada.servidor = data.servidor;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
});