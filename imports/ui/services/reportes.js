const ReportesService = {};

ReportesService.generarReporte = async (data) => {
  return await Meteor.callSync("reportes.generarReporte", data);
};

export { ReportesService };
