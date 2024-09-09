const PageService = {};

PageService.getAll = async () => {
  try {
    const roles = await new Promise((resolve, reject) => {
      Meteor.call("pages.getAll", (error, paginas) => {
        if (error) {
          reject(error);
        } else {
          resolve(paginas);
        }
      });
    });
    return roles;
  } catch (error) {
    console.log("Error al obtener roles:", error);
    return null; // o lanza una excepción según lo que prefieras
  }
};

PageService.getAllWithModules = async () => {
  return await Meteor.callSync("pages.getAllWithModules");
};

PageService.modules = async (pageId) => {
  return await Meteor.callSync("pages.modules", { pageId });
};

PageService.save = async (dataSavePage) => {
  return await Meteor.callSync("pages.save", dataSavePage);
};

export default PageService;
