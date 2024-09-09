import Role from "../collections/Role";

Meteor.methods({
  "roles.getAll": async () => {
    try {
      const roles = await Role.find({}).fetch();
      return roles;
    } catch (error) {
      console.error(error);
      return "asd";
    }
  },

  "roles.save": async (data) => {
    let id;
    try {
      if (data.id === null) {
        id = await Role.createRole(data.name);
        await Role.setModulesAllowed(id, data.modules);
      } else {
        id = await Role.updateRole(
          data.id,
          data.name,
          data.modules,
          data.subroles
        );
      }
    } catch (error) {
      console.error(error);
    }
    return id;
  },

  "roles.modulesId": async ({ roleId }) => {
    let modulesId = [];
    try {
      const role = await Role.find({ _id: roleId }).fetch();

      modulesId = role[0].modules;
    } catch (error) {
      console.log(error);
    }

    return modulesId;
  },
  "roles.getSubrolesByUserId": async (userId) => {
    const role = await Role.getUserRole(userId);

    const roles = await Role.find(
      { _id: { $in: role.subroles } },
      { fields: { name: 1 } }
    ).fetch();
    return roles;
  },
  "roles.getUserRole": async (userId, populate = false) => {
    return await Role.getUserRole(userId, populate);
  },
  "roles.getUserRoleName": async (params) => {
    return await Role.getUserRoleName(params.userId, params.populate);
  },
});
