import Role from "./Role";
import Modulo from "./Modulo";

const Pages = new Mongo.Collection("pages");

Pages.createPage = async (name, path) => {
	const page = await Pages.findOne({ path });
	// if (page) return page._id;

	const id = Pages.insert({ name, path, modules: [] });
	return id;
};

Pages.updatePage = async (name, path, pageId) => {
	const page = await Pages.findOne({ _id: pageId });
	if (page == undefined) return;

	await Pages.update({ _id: pageId }, { name, path, modules: [] });

	return pageId;
};

Pages.setModules = async (pageId, modules) => {
	try {
		let modulesId = [];

		await Modulo.remove({ pageId });

		for (const module of modules) {
			const moduleId = await Modulo.insert({
				pageId,
				name: module.name,
				description: module.description,
			});
			modulesId.push(moduleId);
		}

		return await Pages.update(
			{ _id: pageId },
			{ $set: { modules: modulesId } }
		);
	} catch (ex) {
		console.log(ex);
	}
};

Pages.createDefaultModules = async (page) => {
	await Pages.addModule(page, "view", "Mostrar en el menú");
	await Pages.addModule(page, "create", "Crear");
	await Pages.addModule(page, "edit", "Editar");
	await Pages.addModule(page, "delete", "Eliminar");
};

Pages.addModule = async (pageId, name, description) => {
	const page = await Pages.findOne({ _id: pageId });
	if (page == null) return;

	const data = { pageId, name, description };
	const module = await Modulo.findOne(data);

	if (module == undefined) {
		const moduleId = Modulo.insert(data);
		page.modules.push(moduleId);

		await Pages.update({ _id: pageId }, { $set: { modules: page.modules } });

		return moduleId;
	}

	return module._id;
};

Pages.getModules = async (pageId) => {
	let modules = [];
	modules = await Modulo.find({ pageId }).fetch();

	return modules;
};

export default Pages;
