import React, { useEffect, useState, Fragment } from "react";
import {
	Modal,
	ModalHeader,
	ModalBody,
	ModalFooter,
	Button,
	FormGroup,
	Input,
	Label,
} from "reactstrap";
import useInput from "../../../startup/client/useInput";
import toastr from "toastr";
import { useTranslation } from "react-i18next";
import PageService from "../pages/pages.service";
import RolesService from "./roles.service";

function ModalRoles({ item, ...props }) {
	const { t } = useTranslation();
	const role = useInput({
		name: item ? item.name : "",
	});

	const [open, setOpen] = useState(true);
	const [pages, setPages] = useState([]);

	const toggle = () => {
		setOpen(!open);
	};

	const asyncLoad = async () => {
		try {
			let activeModules = [];

			if (item !== undefined) {
				const roleId = item._id;

				activeModules = await RolesService.modulesId(roleId);
			}

			const pages = await PageService.getAllWithModules();
			for (const page of pages) {
				page.modules = page.modules.map((m) => {
					const findedModule = activeModules.find(
						(idActiveModule) => idActiveModule === m._id
					);
					return { checked: findedModule !== undefined ? true : false, ...m };
				});
			}

			setPages(pages);
		} catch (e) {
			console.log("error", e);
		}
	};

	const save = async () => {
		if (role.name.value.length === 0) {
			toastr.warning(t('roles.modal.warning.mustContainName'));
			return;
		}

		try {
			const selectedModules = pages
				.map((p) => p.modules.filter((m) => m.checked))
				.flat();

			const dataSaveRole = {
				id: item !== undefined ? item._id : null,
				name: role.name.value,
				modules: selectedModules.map((m) => m._id),
			};
			await RolesService.save(dataSaveRole);

			toastr.success(
				item === undefined ? t("roles.modal.success.created") : t("roles.modal.success.updated")
			);

			props.successfulCompletion();
			setOpen(false);
			setTimeout(props.exit, 300);
			props.result();
		} catch (ex) {
			toastr.error(t("roles.modal.error.failedToSave"));
			JSON.parse(error.details).forEach((e)=>{
				formulario[e.name].setinvalid = true;
			});
			console.log(ex);
		}
	};

	const cancelar = () => {
		setOpen(false);
		setTimeout(props.exit, 300);
		props.result(null);
	};

	useEffect(() => {
		asyncLoad();
	}, []);

	const handleCheckbox = (page, module) => {
		const tmp = Array.from(pages);

		const m = tmp[page].modules[module];
		m.checked = !m.checked;

		setPages(tmp);
	};

	return (
		<Modal isOpen={open} toggle={toggle} className="modal-lg">
			<ModalHeader toggle={toggle}>
				{item == undefined ? t("roles.modal.title.create") : t("roles.modal.title.modify")}
			</ModalHeader>

			<ModalBody>
				<div className="row">
					<div className="col-sm-12">
						<Input type="text" placeholder={t("roles.modal.name.placeholder")} {...role.name} />
					</div>
				</div>

				<div className="row">
					<div className="col-sm-12">
						{pages.map((p, pIdx) => (
							<Fragment key={pIdx}>
								<hr />
								<Label>{p.name}</Label>

								<table className="table table-bordered no-margin">
									<tbody>
										{p.modules.map((m, mIdx) => (
											<tr key={m._id}>
												<td>{m.description}</td>
												<td className="text-center col-sm-2">
													<input
														type="checkbox"
														checked={m.checked}
														onChange={() => handleCheckbox(pIdx, mIdx)}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</Fragment>
						))}
					</div>
				</div>
			</ModalBody>
			<ModalFooter>
				<Button color="secondary" onClick={cancelar}>
					{t("button.cancel")}
				</Button>
				<Button color="primary" onClick={save}>
					{t("button.save")}
				</Button>
			</ModalFooter>
		</Modal>
	);
}

export default ModalRoles;
