const RolesService = {};

RolesService.getAll = async () => {
  try {
    const roles = await new Promise((resolve, reject) => {
      Meteor.call("roles.getAll", (error, roles) => {
        if (error) {
          reject(error);
        } else {
          resolve(roles);
        }
      });
    });
    return roles;
  } catch (error) {
    console.log("Error al obtener roles:", error);
    return null; // o lanza una excepción según lo que prefieras
  }
};

RolesService.getSubrolesByUserId = async (userId) => {
  return await Meteor.callSync("roles.getSubrolesByUserId", userId);
};

RolesService.getUserRole = async (userId) => {
  return await Meteor.callSync("roles.getUserRole", userId);
};

RolesService.modulesId = async (roleId) => {
  return await Meteor.callSync("roles.modulesId", { roleId });
};

RolesService.save = async (dataSaveRole) => {
  return await Meteor.callSync("roles.save", dataSaveRole);
};

RolesService.getUserRoleName = async (userId, populate) => {
  return await Meteor.callSync("roles.getUserRoleName", {
    userId: userId,
    populate: populate,
  });
};

export default RolesService;
