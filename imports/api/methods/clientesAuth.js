Meteor.methods({
  "clientesAuth.registro"(usuario) {
    const profile = {
      nombreContacto: usuario.nombreContacto.value,
      telefonoContacto: usuario.telefonoContacto.value,
      correoContacto: usuario.correoContacto.value,
    };
    if (usuario._id == "" || usuario._id == undefined) {
      const usuario_id = Accounts.createUser({
        username: usuario.usuario.value,
        password: usuario.contrasena.value,
        profile,
      });

      if (
        Meteor.roleAssignment.find({ "user._id": usuario_id }).count() === 0
      ) {
        Roles.createRole("cliente", { unlessExists: true });
        Roles.addUsersToRoles(usuario_id, "cliente");
      }
    } else {
      Meteor.users.update({ _id: usuario._id }, { $set: { profile } });
    }
    return true;
  },
});
