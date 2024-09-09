import React, { useEffect, useState } from "react";
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	FormGroup,
	Label,
	Input,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

import toastr from "toastr";
import useInput from "../../../startup/client/useInput";
import { useTranslation } from "react-i18next";
import PageService from "./pages.service";


function ModalPageForm({ item, ...props }) {
	const { t } = useTranslation();
	const page = useInput({
		name: item ? item.name : "",
		path: item ? item.path : "",
	});

	const module = useInput({
		name: "",
		description: "",
	});

	const [modules, setModules] = useState([]);
	const [open, setOpen] = useState(true);

	const toggle = () => {
		setOpen(!open);
	};

	const asyncLoad = async () => {
		try {
			if (item !== undefined) {
				const pageId = item._id;


				const modules = await PageService.modules(pageId);
				setModules(modules);
			}
		} catch (e) {
			console.log("error", e);
		}
	};

	const save = async () => {
		if (page.name.value.length === 0) {
			toastr.warning(t("pages.modal.warning.mustContainName"));
			return;
		}

		if (page.path.value.length === 0) {
			toastr.warning(t("pages.modal.warning.mustContainRoute"));
			return;
		}

		try {
			const dataSavePage = {
				page: {
					name: page.name.value,
					path: page.path.value,
					id: item !== undefined ? item._id : null,
				},
				modules,
			};

			await PageService.save(dataSavePage);

			toastr.success(
				item === undefined ? t("pages.modal.success.created") : t("pages.modal.success.updated")
			);

			props.successfulCompletion();
			setOpen(false);
			setTimeout(props.exit, 300);
			props.result();
		} catch (ex) {
			toastr.error(t("pages.modal.error.failedToSave"));
			console.log(ex);
		}
	};

	const cancelar = () => {
		setOpen(false);
		setTimeout(props.exit, 300);
		props.result(null);
	};

	const addModule = () => {
		if (module.name.value.length === 0) {
			toastr.warning(t('pages.modal.warning.moduleMustContainName'));
			return;
		}

		if (module.description.value.length === 0) {
			toastr.warning(t('pages.modal.warning.moduleMustContainDescription'));
			return;
		}

		const newModule = {
			name: module.name.value,
			description: module.description.value,
		};

		setModules((modules) => [...modules, newModule]);

		module.name.value = "";
		module.description.value = "";
	};

	const deleteModule = (idxModule) => {
		const cpyModules = [...modules];
		cpyModules.splice(idxModule, 1);
		setModules(cpyModules);
	};

	useEffect(() => {
		asyncLoad();
	}, []);

	return (
		<Modal isOpen={open} toggle={toggle} className="modal-lg">
			<ModalHeader toggle={toggle}>
				{item == undefined
					? t("pages.modal.create.title")
					: t("pages.modal.update.title")}
			</ModalHeader>
			<ModalBody>
				<FormGroup>
					<div className="row">
						<div className="col">
							<Input
								type="text"
								placeholder={t("pages.modal.name.placeholder")}
								{...page.name}
							/>
						</div>
						<div className="col">
							<Input
								type="text"
								placeholder={t("pages.modal.route.placeholder")}
								{...page.path}
							/>
						</div>
					</div>
				</FormGroup>

				<FormGroup>
					<Label>{t("pages.modal.modules.label")}</Label>

					<div className="row">
						<div className="col">
							<Input
								type="text"
								placeholder={t("pagesModalModulesNamePlaceholder")}
								{...module.name}
							/>
						</div>
						<div className="col">
							<Input
								type="text"
								placeholder={t("pagesModalModulesDescriptionPlaceholder")}
								{...module.description}
							/>
						</div>
						<div className="col-2 d-flex justify-content-end">
							<Button color="primary" onClick={addModule}>
								<FontAwesomeIcon className="mr-2" icon={faPlus} />
								{t("button.add")}
							</Button>
						</div>
					</div>
				</FormGroup>
				<div className="row">
					<div className="col-sm-12">
						<table className="table table-bordered table-sm table-responsive-sm table-striped">
							<thead>
								<tr>
									<th className="text-center">{t("pages.modal.table.name")}</th>
									<th className="text-center">
										{t("pages.modal.table.description")}
									</th>
									<th className="text-center">
										{t("pages.modal.table.actions")}
									</th>
								</tr>
							</thead>
							<tbody>
								{modules.map((module, idx) => (
									<tr key={idx}>
										<td className="text-center">{module.name}</td>
										<td className="text-center">{module.description}</td>
										<td
											className="text-center"
											onClick={() => {
												deleteModule(idx);
											}}
										>
											<FontAwesomeIcon icon={faMinus} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color="secondary" onClick={cancelar}>
					{t("button.close")}
				</Button>
				<Button color="primary" onClick={save}>
					{t("button.save")}
				</Button>
			</ModalFooter>
		</Modal>
	);
}

export default ModalPageForm;
