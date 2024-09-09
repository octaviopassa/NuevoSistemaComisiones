const UsuariosService = {};

UsuariosService.getAll = async () => {
  return await Meteor.callSync("usuarios.getAll");
};

UsuariosService.getByName = async (nombre, apellidoPaterno) => {
  return await Meteor.callSync("usuarios.getByName", {
    nombre: nombre,
    apellidoPaterno: apellidoPaterno,
  });
};

UsuariosService.getById = async (usuarioId) => {
  return await Meteor.callSync("usuarios.getById", usuarioId);
};

UsuariosService.createUser = async (empleado, rol) => {
  return await Meteor.callSync("usuarios.createUser", {
    empleado: empleado,
    rol: rol,
  });
};

export default UsuariosService;
