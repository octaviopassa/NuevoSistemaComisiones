import { Bitacoras, Permisos } from "../collections/Collections";
import RoleAssignment from "../collections/RoleAssignment";
import Role from "../collections/Role";
import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "usuario.getAll": async () => {
    const usuarios = Meteor.users.find().fetch();
    for (const usuario of usuarios) {
      const rol = RoleAssignment.findOne({
        userId: usuario._id,
      });
      usuario.rol = rol.roleId;
      usuario.rolObj = Role.findOne({ _id: rol.roleId });
    }

    return usuarios;
  },
  "usuarios.getById": async (usuarioId) => {
    const usuario = await Meteor.users.findOne({ _id: usuarioId });
    return usuario;
  },
  "usuario.getByDepartamento": async (depto_id) => {
    const usuarios = Meteor.users
      .find({ "profile.departamentoExterno_id": depto_id })
      .fetch();
    for (const usuario of usuarios) {
      const rol = RoleAssignment.findOne({
        userId: usuario._id,
      });
      usuario.rol = rol.roleId;
      usuario.rolObj = Role.findOne({ _id: rol.roleId });
    }

    return usuarios;
  },
  "usuario.save": async ([usuario, rol]) => {
    try {
      let usuario_id;
      if (usuario._id == "") {
        usuario_id = Accounts.createUser({
          username: usuario.username,
          password: usuario.password,
          profile: usuario.profile,
        });
      } else {
        usuario_id = usuario._id;
        Meteor.users.update(
          { _id: usuario._id },
          { $set: { profile: usuario.profile } }
        );
      }

      Role.setUserRole(usuario_id, rol);

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  "usuario.updatePassword"(usuario_id, password) {
    Accounts.setPassword(usuario_id, password, { logout: true });
    return true;
  },
  "usuario.getUsersByRole"(rol) {
    try {
      const role = Role.findOne({ name: rol });

      const roles = RoleAssignment.find({ roleId: role._id }).fetch();
      let usuarios = [];
      roles.map((rol) => {
        let usuarioActual = Meteor.users.findOne({ _id: rol.userId });
        usuarios.push(usuarioActual);
      });
      return usuarios;
      //usuario = Meteor.users.findOne({ _id:  });
    } catch (e) {
      throw new Meteor.Error("404", "Hubo un error al obtener los usuarios");
    }
  },
  "usuario.getUsersByCustomer"(customer) {
    try {
      const usuarios = Meteor.users.find(customer).fetch();

      return usuarios;
      //usuario = Meteor.users.findOne({ _id:  });
    } catch (e) {
      throw new Meteor.Error("404", "Hubo un error al obtener los usuarios");
    }
  },
  "usuario.getRole"(usuario_id) {
    try {
      return Meteor.roleAssignment.findOne({ "user._id": usuario_id });
    } catch (error) {
      console.error(error);
      throw new Meteor.Error("404", "Hubo un error al obtener los roles");
    }
  },
  "usuario.allowedModules": async (userId) => {
    try {
      const allowedModules = await Role.getPermissionsByUser(userId);
      return allowedModules;
    } catch (e) {
      console.error(e, "ERROR");
      return [];
    }
  },
  "usuario.cambiarIdioma": async (params) => {
    Meteor.users.update(
      { _id: params.userId },
      { $set: { "profile.idioma": params.idioma } }
    );

    return true;
  },
  "usuario.cambiarEstatus": async (usuario_id) => {
    const usuario = Meteor.users.findOne({ _id: usuario_id });
    Meteor.users.update(
      { _id: usuario_id },
      { $set: { "profile.estatus": !usuario.profile.estatus } }
    );

    return true;
  },
  "usuario.savePermisos": ({ userId: _id, permissions }) => {
    Meteor.users.update({ _id }, { $set: { permissions } });
    return true;
  },
  "usuario.getPermisosByUserId": (p) => {
    return Permisos.find({
      usuario_id: p.usuario_id,
      cliente_id: p.cliente_id,
    }).fetch();
  },
  "usuarios.createUser": async (datos) => {
    try {
      const usuario = datos.empleado;
      const rol = datos.rol;

      profile = {
        nombreCompleto:
          usuario.nombre.trim() +
          " " +
          usuario.apellidoPaterno.trim() +
          " " +
          usuario.apellidoMaterno.trim(),
        nombre: usuario.nombre.trim(),
        apellidoPaterno: usuario.apellidoPaterno.trim(),
        apellidoMaterno: usuario.apellidoMaterno.trim(),
        numeroEmpleaado: usuario.cEmpleadoExternoId,
        fechaIngreso: usuario.fechaIngreso,
        departamentoExterno_id: usuario.departamentoId,
        departamento: usuario.departamento,
        puestoExterno_id: usuario.puestoPlantillaId,
        puesto: usuario.puesto,
        estatus: true,
      };

      let usuario_id;
      if (usuario._id == "" || usuario._id == undefined) {
        usuario_id = await Accounts.createUser({
          username: usuario.cEmpleadoExternoId,
          password: usuario.cEmpleadoExternoId,
          profile: profile,
        });
        const admin_role = await Role.createRole(rol);
        Role.setUserRole(usuario_id, admin_role);
      } else {
        usuario_id = usuario._id;
        await Meteor.users.update(
          { _id: usuario._id },
          { $set: { profile: profile } }
        );

        const admin_role = await Role.createRole("Gerente");
        Role.setUserRole(usuario_id, admin_role);
      }

      return true;
    } catch (e) {
      throw new Meteor.Error(e.error, e.reason);
    }
  },
  "usuarios.saveBitacora": async (bitacora) => {
    try {
      await Bitacoras.insert(bitacora);
      await Meteor.users.update(
        { _id: bitacora.usuarioId },
        { $set: { "profile.fechaUltimaSesion": new Date() } }
      );
      return true;
    } catch (e) {
      throw new Meteor.Error(e.error, e.reason);
    }
  },
  "usuarios.getBitacoras": async (data) => {
    try {
      const bitacoras = await Bitacoras.find(data).fetch();

      return bitacoras;
    } catch (e) {
      throw new Meteor.Error(e.error, e.reason);
    }
  },
  "usuarios.loginWithPassa": async (data) => {
    try {
      conexiones.body_bdseleccionada.tipo = "procedimiento";
      conexiones.body_bdseleccionada.baseDatos = data.BASE_DATOS;
      conexiones.body_bdseleccionada.servidor = data.SERVIDOR;
      conexiones.body_bdseleccionada.query = `
        EXEC MP_WEB_LOGIN  
          @NOMBRE_USUARIO='${data.params.nombre_usuario}', 
          @CONTRASENIA = '${data.params.contrasenia}'
      `;

      const response = await axios.get(conexiones.windows_api, {
        data: conexiones.body_bdseleccionada,
      });

      if (response.data.data.esValido) {
        const respuesta = JSON.parse(response.data.data.resultado);
        const userData = respuesta[0];

        // Primero verificamos si existe el usuario con la combinación específica
        let existingUser = Meteor.users.findOne({
          username: data.params.nombre_usuario,
          "profile.baseDatos": data.BASE_DATOS,
        });

        // Verificamos si existe el usuario con el mismo username pero diferente base de datos
        const userWithSameUsername = Meteor.users.findOne({
          username: data.params.nombre_usuario,
        });

        if (!existingUser && userWithSameUsername) {
          // Si existe el usuario pero con otra base de datos, creamos una nueva entrada
          await Meteor.users.update(
            { _id: userWithSameUsername._id },
            {
              $set: {
                profile: {
                  ...userData,
                  baseDatos: data.BASE_DATOS,
                  estatus: true,
                  WEB_REACT_CLIENTE_OBLIGATORIO:
                    userData.WEB_REACT_CLIENTE_OBLIGATORIO === "1",
                },
              },
            }
          );
          const userId = userWithSameUsername._id;

          const admin_role = await Role.createRole("Admin");
          Role.setUserRole(userId, admin_role);

          existingUser = Meteor.users.findOne(userId);
        } else if (!existingUser) {
          // Si no existe el usuario en absoluto, lo creamos
          const userId = Accounts.createUser({
            username: data.params.nombre_usuario,
            password: data.params.contrasenia,
            profile: {
              ...userData,
              baseDatos: data.BASE_DATOS,
              estatus: true,
              WEB_REACT_CLIENTE_OBLIGATORIO:
                userData.WEB_REACT_CLIENTE_OBLIGATORIO === "1",
            },
          });

          const admin_role = await Role.createRole("Admin");
          Role.setUserRole(userId, admin_role);

          existingUser = Meteor.users.findOne(userId);
        }

        // Generar un token de inicio de sesión para el usuario
        const stampedLoginToken = Accounts._generateStampedLoginToken();
        Accounts._insertLoginToken(existingUser._id, stampedLoginToken);

        return {
          success: true,
          data: {
            userData,
            userId: existingUser._id,
            token: stampedLoginToken.token,
          },
        };
      } else {
        return {
          success: false,
          message: response.data.data.mensaje,
          data: "",
        };
      }
    } catch (e) {
      throw new Meteor.Error(e.error, e.reason);
    }
  },
});
