const AdministratorServices = {};

AdministratorServices.getAll = async () => {
  try {
    const usuarios = await new Promise((resolve, reject) => {
      Meteor.call("usuario.getAll", (error, roles) => {
        if (error) {
          reject(error);
        } else {
          resolve(roles);
        }
      });
    });
    return usuarios;
  } catch (error) {
    console.log("Error al obtener usuarios:", error);
    return null; // o lanza una excepción según lo que prefieras
  }
};

AdministratorServices.getByDepartamento = async (depto_id) => {
  try {
    console.log("depto", depto_id);
    const usuarios = await new Promise((resolve, reject) => {
      Meteor.call("usuario.getByDepartamento", depto_id, (error, roles) => {
        if (error) {
          reject(error);
        } else {
          resolve(roles);
        }
      });
    });
    return usuarios;
  } catch (error) {
    console.log("Error al obtener usuarios:", error);
    return null; // o lanza una excepción según lo que prefieras
  }
};

export default AdministratorServices;
