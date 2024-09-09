import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { history } from "../..//../startup/client/history";

function NotAllowed() {
	return (
		<div>
			<div className="h-alt-f d-flex flex-column align-items-center justify-content-center text-center">
				<h1 className="page-error color-fusion-500">
					SIN PERMISO <span className="text-gradient">403</span>
					<small className="fw-500">
						No <u>tienes</u> permiso para acceder a esta página!
					</small>
				</h1>
				<h3 className="fw-500 mb-5">
					Si cree que es un error, pónganse en contacto con el administrador del
					sistema
				</h3>
				
				<button className="btn btn-primary" onClick={history.back}>
					<FontAwesomeIcon icon={faArrowLeft} /> Regresar
				</button>
			</div>
		</div>
	);
}

export default NotAllowed;
