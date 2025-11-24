const ReporteComisionesPagadasService = {};

ReporteComisionesPagadasService.consultar = async (datos) => {
  return await Meteor.callSync("reporteComisionesPagadas.consultar", datos);
};

export { ReporteComisionesPagadasService };
