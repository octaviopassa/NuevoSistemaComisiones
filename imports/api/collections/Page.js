import Role from "./Role";
import { Mongo } from "meteor/mongo";
import Modulo from "./Modulo";

const Pages = new Mongo.Collection("pages");

Pages.createPage = async (name, path) => {
	const page = await Pages.findOneAsync({ path });
	// if (page) return page._id;

	const id = await Pages.insertAsync({ name, path, modules: [] });
	return id;
};

Pages.updatePage = async (name, path, pageId) => {
	const page = await Pages.findOneAsync({ _id: pageId });
	if (page == undefined) return;

	await Pages.updateAsync({ _id: pageId }, { name, path, modules: [] });

	return pageId;
};

Pages.setModules = async (pageId, modules) => {
	try {
		let modulesId = [];

		await Modulo.removeAsync({ pageId });

		for (const module of modules) {
			const moduleId = await Modulo.insertAsync({
				pageId,
				name: module.name,
				description: module.description,
			});
			modulesId.push(moduleId);
		}

		return await Pages.updateAsync(
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
	const page = await Pages.findOneAsync({ _id: pageId });
	if (page == null) return;

	const data = { pageId, name, description };
	const module = await Modulo.findOneAsync(data);

	if (module == undefined) {
		const moduleId = await Modulo.insertAsync(data);
		page.modules.push(moduleId);

		await Pages.updateAsync({ _id: pageId }, { $set: { modules: page.modules } });

		return moduleId;
	}

	return module._id;
};

Pages.getModules = async (pageId) => {
	let modules = [];
	modules = await Modulo.find({ pageId }).fetchAsync();

	return modules;
};

export default Pages;
