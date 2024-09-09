import React from "react";

export const PanelButtons = (data) => {
	return (
		<div>
			<button
				className="btn btn-panel waves-effect waves-themed"
				data-action="panel-collapse"
				data-toggle="tooltip"
				data-offset="0,10"
				data-original-title="Contraer"
			></button>
			<button
				className="btn btn-panel waves-effect waves-themed"
				data-action="panel-fullscreen"
				data-toggle="tooltip"
				data-offset="0,10"
				data-original-title="Pantalla Completa"
			></button>
			<button
				className="btn btn-panel waves-effect waves-themed"
				data-action="panel-close"
				data-toggle="tooltip"
				data-offset="0,10"
				data-original-title="Cerrar"
			></button>
		</div>
	);
};
