const ReporteDepositosService = {};

ReporteDepositosService.consultar = async (datos) => {
  return await Meteor.callSync("reporteDepositos.consultar", datos);
};

export { ReporteDepositosService };
