import SimpleSchema from "simpl-schema";
import { Mongo } from "meteor/mongo";
import RoleAssignment from "../collections/RoleAssignment";
import Modulo from "./Modulo";
import Page from "./Page";

const Role = new Mongo.Collection("rol");

// Role.schema = new SimpleSchema({
// 	name: {
// 		type: String,
// 	},
// 	modules: {
// 		type: String,
// 		optional: true,
// 	},
// 	'modules.$': {
//     type: String,
//   },
// 	subroles: {
// 		type: Array,
// 		optional: true
// 	},
// 	'subroles.$': {
//     type: String,
//   },
// });

// Role.attachSchema(Role.schema);

Role.createRole = async (name) => {
  const role = await Role.findOneAsync({ name });

  if (role) return role._id;

  return await Role.insertAsync({ name, modules: [], subroles: [] });
};

Role.updateRole = async (_id, name, modules, subroles) => {
  const res = await Role.updateAsync({ _id }, { $set: { name, modules, subroles } });
  return _id;
};

Role.setModulesAllowed = async (roleId, modules) => {
  await Role.updateAsync({ _id: roleId }, { $set: { modules } });
};

Role.addModule = async (roleId, moduleId) => {
  const existsModule = await Role.findOneAsync({ _id: roleId, modules: moduleId });

  if (existsModule !== undefined) return;

  const role = await Role.findOneAsync({ _id: roleId });

  if (role.modules == undefined) role.modules = [];

  role.modules.push(moduleId);

  await Role.updateAsync({ _id: roleId }, { $set: { modules: role.modules } });
};

Role.setUserRole = async (userId, roleId) => {
  const roleAssignment = await RoleAssignment.findOneAsync({ userId });

  if (roleAssignment == undefined) {
    await RoleAssignment.insertAsync({ userId, roleId });
    return;
  }

  await RoleAssignment.updateAsync(
    { _id: roleAssignment._id },
    { $set: { roleId } }
  );
};

Role.getPermissionsByUser = async (userId) => {
  const userRole = await Role.getUserRole(userId);
  const pages = await Page.find().fetchAsync();

  const modules = [];
  if (!userRole?.modules) {
    return modules;
  }
  for (const module of userRole.modules) {
    const moduleInfo = await Modulo.findOneAsync({ _id: module });
    const page = pages.find((p) => p._id === moduleInfo.pageId);
    modules.push({ page: page.name, name: moduleInfo.name });
  }

  return modules;
};

Role.getPermissionsByRole = async (roleId) => {
  const role = await Role.findOneAsync({ _id: roleId });
  if (role == null) return null;

  const pages = await Page.find().fetchAsync();

  const modules = [];

  for (const module of role.modules) {
    const moduleInfo = await Modulo.findOneAsync({ _id: module });
    const page = pages.find((p) => p._id === moduleInfo.pageId);
    modules.push({ page: page.name, name: moduleInfo.name });
  }

  return modules;
};

Role.getUserRole = async (userId, populate = true) => {
  const roleAssignment = await RoleAssignment.findOneAsync({ userId });
  if (roleAssignment == undefined) return null;

  if (populate) {
    const userRole = await Role.findOneAsync({ _id: roleAssignment.roleId });
    return userRole;
  }

  return roleAssignment.roleId;
};

Role.getUserRoleName = async (userId, populate = true) => {
  const roleAssignment = await RoleAssignment.findOneAsync({ userId });
  if (roleAssignment == undefined) return null;
  if (populate) return await Role.findOneAsync({ _id: roleAssignment.roleId });
  return null;
};

export default Role;
