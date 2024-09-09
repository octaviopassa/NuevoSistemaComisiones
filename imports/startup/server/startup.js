import Page from "../../api/collections/Page";
import Role from "../../api/collections/Role";

Meteor.startup(setup);

async function setup() {
  if (Page.find().count() === 0) {
    const superAdmin = await Role.createRole("SuperAdmin");
    const adminRole = await Role.createRole("Admin");
    const gerenteRole = await Role.createRole("Gerente");
    const supervisorRole = await Role.createRole("Supervisor");

    const pageHome = await Page.createPage("Home", "/");
    const viewHomeAdmin = await Page.addModule(
      pageHome,
      "view",
      "Permite ver la página de inicio"
    );
    await Role.addModule(adminRole, viewHomeAdmin);

    const pageRoles = await Page.createPage("Roles", "/roles");
    const viewRoles = await Page.addModule(pageRoles, "view", "Mostrar Roles");
    const createRole = await Page.addModule(pageRoles, "create", "Crear Roles");
    await Role.addModule(superAdmin, viewRoles);
    await Role.addModule(superAdmin, createRole);

    const pagePages = await Page.createPage("Pages", "/pages");
    const viewPages = await Page.addModule(
      pagePages,
      "view",
      "Mostrar Páginas"
    );
    const createPages = await Page.addModule(
      pagePages,
      "create",
      "Crear Páginas"
    );
    await Role.addModule(superAdmin, viewPages);
    await Role.addModule(superAdmin, createPages);

    const pageUsuarios = await Page.createPage("Usuarios", "/usuarios");
    const viewUsuarios = await Page.addModule(
      pageUsuarios,
      "view",
      "Mostrar Usuarios"
    );
    const createUsuarios = await Page.addModule(
      pageUsuarios,
      "create",
      "Crear Usuarios"
    );
    await Role.addModule(superAdmin, viewUsuarios);
    await Role.addModule(superAdmin, createUsuarios);
    await Role.addModule(adminRole, viewUsuarios);
    await Role.addModule(adminRole, createUsuarios);
    await Role.addModule(gerenteRole, viewUsuarios);
  }
}
