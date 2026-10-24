import { Bitacoras, Permisos } from "../collections/Collections";
import RoleAssignment from "../collections/RoleAssignment";
import Role from "../collections/Role";
import conexiones from "../../utils/config";
import axios from "axios";

Meteor.methods({
  "usuario.getAll": async () => {
    const usuarios = (await Meteor.users.find().fetchAsync());
    for (const usuario of usuarios) {
      const rol = await RoleAssignment.findOneAsync({
        userId: usuario._id,
      });
      usuario.rol = rol.roleId;
      usuario.rolObj = await Role.findOneAsync({ _id: rol.roleId });
    }

    return usuarios;
  },
  "usuarios.getById": async (usuarioId) => {
    const usuario = await Meteor.users.findOneAsync({ _id: usuarioId });
    return usuario;
  },
  "usuario.getByDepartamento": async (depto_id) => {
    const usuarios = (await Meteor.users
      .find({ "profile.departamentoExterno_id": depto_id })
      .fetchAsync());
    for (const usuario of usuarios) {
      const rol = await RoleAssignment.findOneAsync({
        userId: usuario._id,
      });
      usuario.rol = rol.roleId;
      usuario.rolObj = await Role.findOneAsync({ _id: rol.roleId });
    }

    return usuarios;
  },
  "usuario.save": async ([usuario, rol]) => {
    try {
      let usuario_id;
      if (usuario._id == "") {
        usuario_id = await Accounts.createUserAsync({
          username: usuario.username,
          password: usuario.password,
          profile: usuario.profile,
        });
      } else {
        usuario_id = usuario._id;
        await Meteor.users.updateAsync(
          { _id: usuario._id },
          { $set: { profile: usuario.profile } }
        );
      }

      await Role.setUserRole(usuario_id, rol);

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async "usuario.updatePassword"(usuario_id, password) {
    await Accounts.setPasswordAsync(usuario_id, password, { logout: true });
    return true;
  },
  async "usuario.getUsersByRole"(rol) {
    try {
      const role = await Role.findOneAsync({ name: rol });

      const roles = (await RoleAssignment.find({ roleId: role._id }).fetchAsync());
      let usuarios = [];
      for (const rol of roles) {
        let usuarioActual = await Meteor.users.findOneAsync({ _id: rol.userId });
        usuarios.push(usuarioActual);
      }
      return usuarios;
      //usuario = Meteor.users.findOne({ _id:  });
    } catch (e) {
      throw new Meteor.Error("404", "Hubo un error al obtener los usuarios");
    }
  },
  async "usuario.getUsersByCustomer"(customer) {
    try {
      const usuarios = (await Meteor.users.find(customer).fetchAsync());

      return usuarios;
      //usuario = Meteor.users.findOne({ _id:  });
    } catch (e) {
      throw new Meteor.Error("404", "Hubo un error al obtener los usuarios");
    }
  },
  async "usuario.getRole"(usuario_id) {
    try {
      return await RoleAssignment.findOneAsync({ userId: usuario_id });
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
    await Meteor.users.updateAsync(
      { _id: params.userId },
      { $set: { "profile.idioma": params.idioma } }
    );

    return true;
  },
  "usuario.cambiarEstatus": async (usuario_id) => {
    const usuario = await Meteor.users.findOneAsync({ _id: usuario_id });
    await Meteor.users.updateAsync(
      { _id: usuario_id },
      { $set: { "profile.estatus": !usuario.profile.estatus } }
    );

    return true;
  },
  "usuario.savePermisos": async ({ userId: _id, permissions }) => {
    await Meteor.users.updateAsync({ _id }, { $set: { permissions } });
    return true;
  },
  "usuario.getPermisosByUserId": async (p) => {
    return (await Permisos.find({
      usuario_id: p.usuario_id,
      cliente_id: p.cliente_id,
    }).fetchAsync());
  },
  "usuarios.createUser": async (datos) => {
    try {
      const usuario = datos.empleado;
      const rol = datos.rol;

      const profile = {
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
        usuario_id = await Accounts.createUserAsync({
          username: usuario.cEmpleadoExternoId,
          password: usuario.cEmpleadoExternoId,
          profile: profile,
        });
        const admin_role = await Role.createRole(rol);
        await Role.setUserRole(usuario_id, admin_role);
      } else {
        usuario_id = usuario._id;
        await Meteor.users.updateAsync(
          { _id: usuario._id },
          { $set: { profile: profile } }
        );

        const admin_role = await Role.createRole("Gerente");
        await Role.setUserRole(usuario_id, admin_role);
      }

      return true;
    } catch (e) {
      throw new Meteor.Error(e.error, e.reason);
    }
  },
  "usuarios.saveBitacora": async (bitacora) => {
    try {
      await Bitacoras.insertAsync(bitacora);
      await Meteor.users.updateAsync(
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
      const bitacoras = await Bitacoras.find(data).fetchAsync();

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
        let existingUser = await Meteor.users.findOneAsync({
          username: data.params.nombre_usuario,
          "profile.baseDatos": data.BASE_DATOS,
        });

        // Verificamos si existe el usuario con el mismo username pero diferente base de datos
        const userWithSameUsername = await Meteor.users.findOneAsync({
          username: data.params.nombre_usuario,
        });

        if (!existingUser && userWithSameUsername) {
          // Si existe el usuario pero con otra base de datos, creamos una nueva entrada
          await Meteor.users.updateAsync(
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
          await Role.setUserRole(userId, admin_role);

          existingUser = await Meteor.users.findOneAsync(userId);
        } else if (!existingUser) {
          // Si no existe el usuario en absoluto, lo creamos
          const userId = await Accounts.createUserAsync({
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
          await Role.setUserRole(userId, admin_role);

          existingUser = await Meteor.users.findOneAsync(userId);
        }
        else if (existingUser && userWithSameUsername) {
          // Si existe el usuario con la misma base de datos, actualizamos sus datos
          await Meteor.users.updateAsync(
            { _id: existingUser._id },
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
        }

        // Generar un token de inicio de sesión para el usuario
        const stampedLoginToken = Accounts._generateStampedLoginToken();
        await Accounts._insertLoginToken(existingUser._id, stampedLoginToken);

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
