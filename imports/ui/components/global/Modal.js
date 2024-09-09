import React from "react";
import ReactDOM from "react-dom";
// import { Provider } from "react-redux";
// import { store } from "../../startup/client/store";



const showModal2 = (Component, props = {}) => new Promise((res) => {

	const div = document.createElement("div");
	document.body.appendChild(div);

	const exit = (result = null) => {
		ReactDOM.unmountComponentAtNode(div);
		document.body.removeChild(div)

		res(result)
	};
Input
	ReactDOM.render(
			<Component exit={exit} {...props} />,
		div
	);
})

const showModal = (Modal, props) =>
	new Promise((res, rej) => {
		renderModal(Modal, {
			result: (result) => res(result),
			...props,
		});
	});

function renderModal(Children, props) {
	const div = document.createElement("div");
	document.body.appendChild(div);

	const exit = () => {
		ReactDOM.unmountComponentAtNode(div);
		if (props && props.onClose) props.onClose();
	};

	ReactDOM.render(
			<Children exit={exit} {...props} />,
		div
	);
}

export { showModal, showModal2, renderModal };
