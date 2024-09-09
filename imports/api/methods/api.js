const { Accesos } = require("../collections/Collections");

export const apiGetQuerys = async (objeto) => {
	const axios = require("axios");
	const configuracion = Accesos.findOne({ alias: objeto.aliasAcceso });
	const data = {};
	//datos del servidor
	data.usuario = configuracion.usuario;
	data.contrasena = configuracion.password;
	const url = "http://192.168.15.102/webapiquerys/api/querys/ejecutar"; //configuracion.api;

	data.usuario = configuracion.usuario;
	data.contrasena = configuracion.contrasena;
	data.servidor = configuracion.servidor;
	data.baseDatos = configuracion.baseDatos;
	data.parametros = objeto.parametros;
	data.query = objeto.query;
	data.tipo =
		objeto.esProcedimientoAlmacenado != undefined &&
		objeto.esProcedimientoAlmacenado
			? "procedimientoAlmacenado"
			: "consulta";
	data.esValido = true;
	data.mensaje = "";
	data.resultado = "";

	try {
		let res = await axios({
			url: url,
			method: "get",
			data: data,
			timeout: 50000, //configuracion.timeoutApi,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
		});

		if (res.status == 200) {
			return JSON.parse(res.data.data.resultado);
		}
		// Don't forget to return something
	} catch (err) {
		console.error("error en Api:", err);
		throw new Meteor.Error("404", `Error en la api ${err}`);
	}
};
