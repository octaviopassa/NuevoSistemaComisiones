module.exports = {
  windows_api: "http://172.16.101.213/querys/api/querys/ejecutar",
  windows_api_post: "http://172.16.101.213/querys/api/querys/ejecutarPost",
  body_fabrica: {
    usuario: "sa",
    contrasena: "SU2orange!",
    servidor: "192.168.68.111,1433\\SQLEXPRESS",
    baseDatos: "FABRICA_PASSA",
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
  body_empresas: {
    usuario: "sa",
    contrasena: "SU2orange!",
    servidor: "192.168.68.111,1433\\SQLEXPRESS",
    baseDatos: "EMPRESAS",
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
  body_bdseleccionada: {
    servidor: "192.168.68.111,1433\\SQLEXPRESS",
    baseDatos: "",
    usuario: "sa",
    contrasena: "SU2orange!",
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
  instancias: [
    { baseDatos: "FABRICA_PASSA", instancia: "SERVERR2" },
    { baseDatos: "IANSA", instancia: "IANSA" },
    { baseDatos: "SMARTCARB", instancia: "IANSA" },
    { baseDatos: "VICTOR_PADILLA", instancia: "VPD" },
  ],
  getInstancia: (url, baseDatos) => {
    const instancia = this.instancias.find((e) => e.baseDatos === baseDatos);
    return `${url}\\${instancia.instancia}`;
  },
};
