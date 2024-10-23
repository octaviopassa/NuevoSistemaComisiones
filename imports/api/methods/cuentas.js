import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "cuentas.getBancos": async (baseDatos) => {
    try {
      conexiones.body_bdseleccionada.tipo = "consulta";
      conexiones.body_bdseleccionada.baseDatos = baseDatos;
      conexiones.body_bdseleccionada.query = `SELECT 
        NOMBRE_BANCO CODIGO,
        NOMBRE_BANCO NOMBRE 
      FROM CAT_BANCOS 
      ORDER BY NOMBRE_BANCO
      `;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      return JSON.parse(response.data.data.resultado);
    } catch (e) {
      console.log(e);
    }
  },
  "cuentas.insert": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
          exec MP_CATALOGOS_CUENTA_DESTINO_GRABA 
          @ID_CUENTA_DESTINO='0',
          @NOMBRE_COMPLETO='${data.nombre}',
          @APELLIDOS='${data.apellidos}',
          @NUMERO='${data.num_tarjeta}',
          @TIPO='${data.tipo}',
          @BANCO='${data.banco}',
          @CURP='${data.curp}',
          @RFC='${data.rfc}',
          @Estatus='${data.estatus ? "A" : "B"}',
          @CODIGO_USUARIO_GRABO='${data.cod_usu}',
          @ACCION='INSERTAR'
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
  "cuentas.update": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = "consumos_passa";
      conexiones.body_bdseleccionada.query = `
            exec MP_CATALOGOS_CUENTA_DESTINO_GRABA 
            @ID_CUENTA_DESTINO='${data.codigo}',
            @NOMBRE_COMPLETO='${data.nombre}',
            @APELLIDOS='${data.apellidos}',
            @NUMERO='${data.num_tarjeta}',
            @TIPO='${data.tipo}',
            @BANCO='${data.banco}',
            @CURP='${data.curp}',
            @RFC='${data.rfc}',
            @Estatus='${data.estatus ? "A" : "B"}',
            @CODIGO_USUARIO_GRABO='${data.cod_usu}',
            @ACCION='ACTUALIZAR'
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

/**
    exec MP_CATALOGOS_CUENTA_DESTINO_GRABA 
    @ID_CUENTA_DESTINO='0', (Si se inserta siempre es 0, si se actualiza  es el id de la cuenta)
    @NOMBRE_COMPLETO='Octavio', (textbox nombre)
    @APELLIDOS='Avila', (textbox apellido)
    @NUMERO='1234567891234567', (textbox numero cuenta)
    @TIPO='TARJETA DE DEBITO', (combo tipo cuenta destino)
    @BANCO='BBVA BANCOMER', (combo banco cuenta destino)
    @CURP='123456789123456789', (textbox curp)
    @RFC='1234567891234', (textbox RFC)
    @Estatus='A', (Letra A o B como cadena dependiendo si es Activo/Baja)
    @CODIGO_USUARIO_GRABO='K5', (el usuario conectado)
    @ACCION='INSERTAR' (INSERTAR o ACTUALIZAR como cadena según corresponda)

 */
