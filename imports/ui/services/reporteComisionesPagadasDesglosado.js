const ReporteComisionesPagadasDesglosadoService = {};

ReporteComisionesPagadasDesglosadoService.consultar = async (datos) => {
  return await Meteor.callSync("reporteComisionesPagadasDesglosado.consultar", datos);
};

export { ReporteComisionesPagadasDesglosadoService };
