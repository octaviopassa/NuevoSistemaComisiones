const ReportesService = {};

ReportesService.generarReporte = async (data, baseDatos) => {
  return await Meteor.callSync("reportes.generarReporte", data, baseDatos);
};

export { ReportesService };
