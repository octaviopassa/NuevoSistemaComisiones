import Role from "../collections/Role";

Meteor.methods({
  async "clientesAuth.registro"(usuario) {
    const profile = {
      nombreContacto: usuario.nombreContacto.value,
      telefonoContacto: usuario.telefonoContacto.value,
      correoContacto: usuario.correoContacto.value,
    };
    if (usuario._id == "" || usuario._id == undefined) {
      const usuario_id = await Accounts.createUserAsync({
        username: usuario.usuario.value,
        password: usuario.contrasena.value,
        profile,
      });

      const roleId = await Role.createRole("cliente");
      await Role.setUserRole(usuario_id, roleId);
    } else {
      await Meteor.users.updateAsync({ _id: usuario._id }, { $set: { profile } });
    }
    return true;
  },
});
