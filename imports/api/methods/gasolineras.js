import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "gasolineras.getAll": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query =
        "exec dbo.SP_Cat_Gasolineras_Consulta @Cod_Gasolinera='', @Nom_Gasolinera='', @Estatus='', @Cod_Plaza='" +
        datos.plaza +
        "'";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
});
