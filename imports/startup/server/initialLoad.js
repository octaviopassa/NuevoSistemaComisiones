import Role from "../../api/collections/Role";

Meteor.startup(initialLoad);

async function initialLoad() {
  if (Meteor.users.find().count() === 0) {
    // Crear los roles
    const superAdmin_role = await Role.createRole("SuperAdmin");
    const usuario_id = Accounts.createUser({
      username: "roberto",
      password: "roberto",
      profile: {
        nombre: "Roberto Zamarripa",
        nombreCompleto: "Roberto Zamarripa",
        path: "",
        estatus: true,
      },
    });
    Role.setUserRole(usuario_id, superAdmin_role);
  }
}
