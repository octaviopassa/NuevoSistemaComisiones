import Role from "../../api/collections/Role";

Meteor.startup(initialLoad);

async function initialLoad() {
  if ((await Meteor.users.find().countAsync()) === 0) {
    // Crear los roles
    const superAdmin_role = await Role.createRole("SuperAdmin");
    const usuario_id = await Accounts.createUserAsync({
      username: "roberto",
      password: "roberto",
      profile: {
        nombre: "Roberto Zamarripa",
        nombreCompleto: "Roberto Zamarripa",
        path: "",
        estatus: true,
      },
    });
    await Role.setUserRole(usuario_id, superAdmin_role);
  }
}
