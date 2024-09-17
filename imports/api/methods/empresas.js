import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "empresas.getAll": async () => {
    conexiones.body_empresas.tipo = "consulta";
    conexiones.body_empresas.query = "SELECT * FROM empresas..CAT_DB_EMPRESAS";
    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_empresas,
    });

    return JSON.parse(response.data.data.resultado);
  },
  "plazas.getAll": async (datos) => {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.query =
      "EXEC MP_WEB_LOGIN_PAZAS_USUARIO " +
      " @Cod_Usu  = '" +
      datos.cod_usu +
      "'," +
      " @EsLogin = 0";
    conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;
    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "ingenieros.getAll": async (datos) => {
    conexiones.body_bdseleccionada.tipo = "procedimiento";
    conexiones.body_bdseleccionada.query =
      "exec SPCB_Carga_Combo_Ingenieros @Plaza= '" +
      datos.plaza +
      "', @HTML = 0";
    conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;
    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "gastos.pagarA": async (datos) => {
    conexiones.body_bdseleccionada.tipo = "consulta";
    conexiones.body_bdseleccionada.query =
      "SELECT ID_CUENTA_DESTINO Codigo, NOMBRE_CUENTA_DESTINO  Nombre FROM CONSUMOS_PASSA..CAT_CUENTAS_DESTINO WHERE ESTATUS= 'A' AND cod_usu='" +
      datos.cod_usu +
      "'";
    conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;

    const response = await axios.get(conexiones.windows_api, {
      data: conexiones.body_bdseleccionada,
    });

    const respuesta = JSON.parse(response.data.data.resultado);

    return respuesta;
  },
  "clientes.getAll": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query =
        "Exec MP_Consulta_Clientes_Consumos_Nombre_RFC @Texto_Buscar ='" +
        datos.search +
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

  "clientes.clientesVisible": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.query =
        "SELECT MOSTRAR_COLUMNA_CLIENTES FROM empresas..CAT_DB_EMPRESAS WHERE BASE_DATOS='" +
        datos.baseDatos +
        "'";
      conexiones.body_bdseleccionada.baseDatos = datos.baseDatos;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      const respuesta = JSON.parse(response.data.data.resultado);

      return respuesta[0].MOSTRAR_COLUMNA_CLIENTES;
    } catch (e) {
      console.log(e);
    }
  },
  "tipoGastos.getAll": async (datos) => {
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
  "vehiculos.getAll": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.query =
        "exec dbo.SP_Cat_Vehiculos_Consulta @CODIGO_VEHICULO=0, @NOMBRE_VEHICULO='', @PLACA='', @MODELO='', @NUMERO_SERIE='', @POLIZA_SEGURO='', @CODIGO_ENCARGADO=0, @COD_ZONA='', @ESTATUS=' ', @ES_VEHICULO_OFICIAL='0', @CODIGO_VEHICULO_OFICIAL=0,@Plaza='" +
        datos.plaza +
        "'";
      datos.plaza + "'";
      console.log("vehiculos", conexiones.body_bdseleccionada.query);
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "combustibles.getAll": async (datos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.query =
        "SELECT TIPO_COMBUSTIBLE Codigo, NOM_TIPO_COMBUSTIBLE Nombre FROM CAT_TIPOS_COMBUSTIBLES";
      console.log(conexiones.body_bdseleccionada.query);
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
