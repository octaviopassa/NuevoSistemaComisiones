import Modulo from "../collections/Modulo";
import Pages from "../collections/Page";

Meteor.methods({
  "pages.getAll": async () => {
    const paginas = await Pages.find({}).fetch();
    return paginas;
  },
  "pages.save": async (data) => {
    let pageId;
    if (data.page.id === null) {
      pageId = await Pages.createPage(data.page.name, data.page.path);
    } else {
      pageId = await Pages.updatePage(
        data.page.name,
        data.page.path,
        data.page.id
      );
    }
    await Pages.setModules(pageId, data.modules);

    return pageId;
  },
  "pages.modules": async ({ pageId }) => {
    const modules = await Pages.getModules(pageId);
    return modules;
  },
  "pages.getAllWithModules": async () => {
    const pages = await Pages.find({}).fetch();
    const modules = await Modulo.find({}).fetch();

    for (const page of pages) {
      page.modules = modules.filter((m) => m.pageId == page._id);
    }

    return pages;
  },
});
