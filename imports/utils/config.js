module.exports = {
  windows_api: "http://192.168.20.154:49824/api/querys/ejecutar",
  windows_api_post: "http://192.168.20.154:49824/api/querys/ejecutarPost",
  body_fabrica: {
    usuario: "abacoapp",
    contrasena: "S1stem@Pas5@",
    servidor: "192.168.20.3\\SERVERR2",
    baseDatos: "FABRICA_PASSA",
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
  body_empresas: {
    usuario: "abacoapp",
    contrasena: "S1stem@Pas5@",
    servidor: "192.168.20.3\\SERVERR2",
    baseDatos: "EMPRESAS",
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
  body_bdseleccionada: {
    servidor: "192.168.20.3\\SERVERR2",
    baseDatos: "",
    usuario: "abacoapp",
    contrasena: "S1stem@Pas5@",
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
  // instancias: [
  //   { baseDatos: "FABRICA_PASSA", instancia: "SERVERR2" },
  //   { baseDatos: "IANSA", instancia: "IANSA" },
  //   { baseDatos: "SMARTCARB", instancia: "IANSA" },
  //   { baseDatos: "VICTOR_PADILLA", instancia: "VPD" },
  // ],
  // getInstancia: (url, baseDatos) => {
  //   const instancia = this.instancias.find((e) => e.baseDatos === baseDatos);
  //   return `${url}\\${instancia.instancia}`;
  // },
};
