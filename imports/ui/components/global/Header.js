import React from "react";
import { useNavigate } from "react-router-dom";
import toastr from "toastr";
import { useTranslation, Trans } from "react-i18next";
import UserService from "../../services/user";
import useUserLoggedStore from "../../store/userLogged";
import useUserLenguageStore from "../../store/userLenguage";
import useUserModulesStore from "../../store/userModules";
import useUserRolStore from "../../store/userRol";
import useUserSession from "../../store/userSession";
import Swal from "sweetalert2";

export const Header = () => {
  const { t, i18n } = useTranslation();
  const { resetAllowedModules } = useUserModulesStore();
  const { resetUserLenguage, setUserLenguage } = useUserLenguageStore();
  const { resetUserLogged } = useUserLoggedStore();
  const { resetUserSession, session } = useUserSession();
  const { resetUserRol, rol } = useUserRolStore();
  const navigate = useNavigate();

  const user = {
    ...session,
    rol: rol,
  };

  const Logout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: "¿Seguro que quieres cerrar sesión?",
      showCancelButton: true,
      confirmButtonText: "Si",
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        resetAllowedModules();
        resetUserLenguage();
        resetUserSession();
        resetUserLogged();
        resetUserRol();
        navigate("/");
        Meteor.logout();
      }
    });
  };

  return (
    <header className="page-header" role="banner">
      <div className="page-logo">
        <a
          href="#"
          className="page-logo-link press-scale-down d-flex align-items-center position-relative"
          data-toggle="modal"
          data-target="#modal-shortcut"
        >
          <img
            src="/img/logo.svg"
            alt="SmartAdmin WebApp"
            aria-roledescription="logo"
          />
          {/* <span className="page-logo-text mr-1">DOGANA</span> */}
          <span className="position-absolute text-white opacity-50 small pos-top pos-right mr-2 mt-n2"></span>
          <i className="fal fa-angle-down d-inline-block ml-1 fs-lg color-primary-300"></i>
        </a>
      </div>

      <div className="ml-auto d-flex">
        <div>
          <a
            href="#"
            data-toggle="dropdown"
            title={user.profile ? user.profile.nombreCompleto : "Cargando..."}
            className="header-icon d-flex align-items-center justify-content-center ml-2"
          >
            <img
              src="/img/user.png"
              className="profile-image rounded-circle"
              alt={user.profile ? user.profile.nombreCompleto : ""}
              style={{ height: "30px", width: "30px" }}
            />
            {/* <span className="ml-1 mr-1 text-truncate text-truncate-header hidden-xs-down">
							{user.data ? user.data.profile.nombreCompleto : ""}
						</span> 
						<i className="ni ni-chevron-down hidden-xs-down"></i>*/}
          </a>
          <div className="dropdown-menu dropdown-menu-animated dropdown-lg">
            <div className="dropdown-header bg-trans-gradient d-flex flex-row py-4 rounded-top">
              <div className="d-flex flex-row align-items-center mt-1 mb-1 color-white">
                <span className="mr-2">
                  <img
                    src="/img/user.png"
                    className="rounded-circle profile-image"
                    alt={user.profile ? user.profile.nombreCompleto : ""}
                    width={100}
                  />
                </span>
                <div className="info-card-text">
                  <div className="fs-lg text-truncate text-truncate-lg">
                    {user.profile ? user.profile.nombreCompleto : ""}
                  </div>
                  <span className="text-truncate text-truncate-md opacity-80">
                    {user ? user.rol : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="dropdown-divider m-0"></div>
            <a
              className="dropdown-item fw-500 pt-3 pb-3"
              href=""
              onClick={(e) => {
                Logout(e);
              }}
            >
              <span data-i18n="drpdwn.page-logout">{t("header.logout")}</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};
