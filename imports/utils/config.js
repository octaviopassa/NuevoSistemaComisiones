require('dotenv').config()

module.exports = {
  windows_api: process.env.WINDOWS_API,
  windows_api_post: process.env.WINDOWS_API_POST,
  body_empresas: {
    usuario: process.env.DB_USER_EMPRESAS,
    contrasena: process.env.DB_PASSWORD_EMPRESAS,
    servidor: process.env.DB_SERVER_EMPRESAS,
    baseDatos: process.env.DB_DATABASE_EMPRESAS,
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
  body_bdseleccionada: {
    usuario: process.env.DB_USER_BDSELECCIONADA,
    contrasena: process.env.DB_PASSWORD_BDSELECCIONADA,
    servidor: process.env.DB_SERVER_BDSELECCIONADA,
    baseDatos: "",
    parametros: [],
    esValido: true,
    mensaje: "",
    resultado: "",
  },
};
