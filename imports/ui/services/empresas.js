const EmpresasService = {};

EmpresasService.getAll = async () => {
  const empresas = await Meteor.callSync("empresas.getAll");

  return empresas.map((item) => ({
    value: JSON.stringify(item),
    label: item.BASE_DATOS.trim(),
  }));
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

EmpresasService.getRFC = async (database) => {
  return await Meteor.callSync("empresas.getRFC", database);
};

export { EmpresasService };
