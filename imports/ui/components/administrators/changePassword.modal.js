import React, { useState } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";
import { useTranslation } from "react-i18next";

import useInput from "../../../startup/client/useInput";
import Input from "../global/Input";

function ModalCambiarContrasena({ usuario_id, ...props }) {
	const { t } = useTranslation();
	let formulario = useInput({
		_id: {
			value: usuario_id,
			schema: {
				type: "string",
			},
		},
		password: {
			value: "",
			schema: {
				type: String,
				min: 6,
				required: true,
			},
		},
	});

	const [open, setOpen] = useState(true);

	const toggle = () => {
		setOpen(!open);
	};

	const guardar = () => {
		Meteor.call(
			"usuario.updatePassword",
			formulario._id.value,
			formulario.password.value,
			"Admin",
			function (error, result) {
				if (result) {
					formulario = {
						_id: "",
						password: "",
					};
				}
			}
		);

		setOpen(false);
		setTimeout(props.exit, 300);
		props.result(true);
	};

	const cancelar = () => {
		setOpen(false);
		setTimeout(props.exit, 300);
		props.result(null);
	};

	return (
		<Modal isOpen={open} toggle={toggle}>
			<ModalHeader toggle={toggle}>{t("users.client.modalChangePassword.title")}</ModalHeader>
			<ModalBody>
				<Input
					etiqueta={t("users.client.modalChangePassword.passwordLabel")}
					placeholder={t("users.client.modalChangePassword.passwordPlaceholder")}
					{...formulario.password}
				/>
			</ModalBody>
			<ModalFooter>
				<Button color="primary" onClick={guardar}>
					{t("button.save")}
				</Button>
				<Button color="secondary" onClick={cancelar}>
					{t("button.cancel")}
				</Button>
			</ModalFooter>
		</Modal>
	);
}

export default ModalCambiarContrasena;
