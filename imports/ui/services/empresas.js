const EmpresasService = {};

EmpresasService.getAll = async () => {
  return await Meteor.callSync("empresas.getAll");
};

EmpresasService.getByName = async (nombre) => {
  return await Meteor.callSync("usuarios.getByName", {
    nombre: nombre,
    apellidoPaterno: apellidoPaterno,
  });
};

EmpresasService.getById = async (empresaId) => {
  return await Meteor.callSync("empresas.getById", empresaId);
};

export default EmpresasService;
