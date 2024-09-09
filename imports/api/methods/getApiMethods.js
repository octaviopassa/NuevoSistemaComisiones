import { apiGetQuerys } from "./api";

Meteor.methods({
	"import.getEmpresas": async function () {
		const data = {};
		data.arreglo = "";
		const parametrosApi = {};
		let query =
			"SELECT [id] ,[empresaExternaId] ,[razonSocial] ,[descripcion],[rfc],[estatus] FROM [dbo].[ctl_empresas] (nolock)";
		try {
			parametrosApi.parametros = [];
			parametrosApi.esProcedimientoAlmacenado = false;
			parametrosApi.query = query;
			parametrosApi.aliasAcceso = "central";
			data.arreglo = await apiGetQuerys(parametrosApi);
			return data.arreglo;
		} catch (error) {
			console.log(error);
			throw new Meteor.Error(
				"404",
				"Error al invocar la api para obtener las empresas:"
			);
		}
	},
	"import.getCuentas": async function () {
		const data = {};
		data.arreglo = "";
		const parametrosApi = {};
		let query =
			"SELECT [CCUENTA_CNT], [CCTA_PADRE], [CDESCRIP] FROM CUENTAS_CNT  (nolock)" +
			"WHERE CCTA_PADRE = '00000000000000000000000000000000000000000000000000'";
		try {
			parametrosApi.parametros = [];
			parametrosApi.esProcedimientoAlmacenado = false;
			parametrosApi.query = query;
			parametrosApi.aliasAcceso = "calzzapato";
			data.arreglo = await apiGetQuerys(parametrosApi);
			return data.arreglo;
		} catch (error) {
			console.log(error);
			throw new Meteor.Error(
				"404",
				"Error al invocar la api para obtener las empresas:"
			);
		}
	},
	"import.getSubCuentas": async function (cuentaPadre) {
		const data = {};
		data.arreglo = "";
		const parametrosApi = {};
		let query =
			"SELECT [CCUENTA_CNT], [CCTA_PADRE], [CDESCRIP] FROM CUENTAS_CNT  (nolock) " +
			"WHERE [CCTA_PADRE] = '" +
			cuentaPadre +
			"'";
		try {
			parametrosApi.parametros = [];
			parametrosApi.esProcedimientoAlmacenado = false;
			parametrosApi.query = query;
			parametrosApi.aliasAcceso = "calzzapato";
			data.arreglo = await apiGetQuerys(parametrosApi);
			return data.arreglo;
		} catch (error) {
			console.log(error);
			throw new Meteor.Error(
				"404",
				"Error al invocar la api para obtener las empresas:"
			);
		}
	},
});
