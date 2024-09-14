const UserService = {};

UserService.allowedModules = async (userId) => {
  return await Meteor.callSync("usuario.allowedModules", userId);
};

UserService.getEmpresasWithAccess = async (userId) => {
  return await Meteor.callSync("usuario.getEmpresasWithAccess", userId);
};

UserService.getUsersByRole = async (roleName) => {
  return await Meteor.callSync("usuario.getUsersByRole", roleName);
};

UserService.getUsersByCustomer = async (userId) => {
  return await Meteor.callSync("usuario.getUsersByCustomer", {
    "profile.cliente_id": userId,
  });
};

UserService.getAllByEmpresa = async (companyId) => {
  return await Meteor.callSync("usuarios.getAllByEmpresa", companyId);
};

UserService.allowedModulesForEmpresa = async (userId, empresaId) => {
  return await Meteor.callSync("usuario.allowedModulesForEmpresa", {
    userId,
    empresaId,
  });
};

UserService.cambiarIdioma = async (userId, idioma) => {
  return await Meteor.callSync("usuario.cambiarIdioma", { userId, idioma });
};

UserService.cambiarEstatus = async (item) => {
  return await Meteor.callSync("usuarios.cambiarEstatus", item);
};

UserService.save = async (userData, typeUser) => {
  return await Meteor.callSync("usuario.save", userData, typeUser);
};

UserService.saveClient = async (userData, userId) => {
  return await Meteor.callSync("usuario.saveClient", userData, userId);
};

UserService.savePermisos = async (userId, permissions) => {
  return await Meteor.callSync("usuario.savePermisos", { userId, permissions });
};

UserService.saveBitacora = async (bitacora) => {
  return await Meteor.callSync("usuarios.saveBitacora", bitacora);
};

UserService.getBitacoras = async (data) => {
  return await Meteor.callSync("usuarios.getBitacoras", data);
};

UserService.loginWithPassa = async (datos) => {
  return await Meteor.callSync("usuarios.loginWithPassa", datos);
};

export { UserService };
