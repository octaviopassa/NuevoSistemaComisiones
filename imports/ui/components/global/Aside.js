import React, { useEffect, useState } from "react";
import {
  faRightFromBracket,
  faUsersGear,
  faUserGroup,
  faFile,
  faHome,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import ProtectModule from "./ProtectModule";
import Swal from "sweetalert2";
import {
  useUserLoggedStore,
  useUserLenguageStore,
  useUserModulesStore,
  useUserRolStore,
  useUserSession,
} from "../../store";
import { Link } from "react-router-dom";

export const Aside = () => {
  const { t } = useTranslation();
  const { resetAllowedModules } = useUserModulesStore();
  const { resetUserLenguage } = useUserLenguageStore();
  const { resetUserLogged } = useUserLoggedStore();
  const { resetUserSession, session } = useUserSession();
  const { resetUserRol, rol } = useUserRolStore();

  const user = {
    ...session,
    rol: rol,
  };

  const [activeLink, setActiveLink] = useState();
  const [Sidebar, setSidebar] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 767) {
        setSidebar(true);
      } else {
        setSidebar(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const Logout = () => {
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
        Meteor.logout();
      }
    });
  };

  const ShowSidebars = () => setSidebar(!Sidebar);

  return (
    <div>
      <div className={Sidebar ? "sidebar open" : "sidebar"}>
        <div className="logo-details">
          <div className="logo-name">
            <img src="/img/logo-header.png" alt="" className="" />
          </div>

          {/* <FontAwesomeIcon
            icon={faBars}
            className="icono1"
            id="btn"
            onClick={ShowSidebars}
          /> */}
        </div>
        <ul className="nav-list">
          <li>
            <Link data-filter-tags="Home" to="/">
              <FontAwesomeIcon icon={faHome} className="icono1" />

              <span className="linkname">Inicio</span>
            </Link>
            <span className="tooltip">Inicio</span>
          </li>
          <ProtectModule method="remove" page="Roles" module="view">
            <li>
              <Link data-filter-tags="Roles" to="/roles">
                <FontAwesomeIcon icon={faUserGroup} className="icono1" />

                <span className="linkname">Roles</span>
              </Link>
              <span className="tooltip">Roles</span>
            </li>
          </ProtectModule>
          <ProtectModule method="remove" page="Pages" module="view">
            <li>
              <Link data-filter-tags="Pages" to="/pages">
                <FontAwesomeIcon icon={faFile} className="icono1" />
                <span className="linkname">Páginas</span>
              </Link>
              <span className="tooltip">Páginas</span>
            </li>
          </ProtectModule>
          <ProtectModule method="remove" page="Usuarios" module="view">
            <li>
              <Link data-filter-tags="Usuarios" to="/usuarios">
                <FontAwesomeIcon icon={faUsersGear} className="icono1" />

                <span className="linkname">Usuarios</span>
              </Link>
              <span className="tooltip">Usuarios</span>
            </li>
          </ProtectModule>
          <ProtectModule method="remove" page="Gastos" module="view">
            <li>
              <Link data-filter-tags="Gastos" to="/gastos">
                <FontAwesomeIcon icon={faBuilding} className="icono1" />

                <span className="linkname">Gastos</span>
              </Link>
              <span className="tooltip">Gastos</span>
            </li>
          </ProtectModule>
        </ul>

        <div className="profile-content">
          <div className="profile-details">
            <div className="name-job">
              <div className="name" style={{ fontSize: "8pt" }}>
                {user?.profile ? user.profile.nombreCompleto : "Usuario"}
              </div>
              <div className="name">
                {user?.rol != undefined ? user.rol : "Perfil"}
              </div>
            </div>
          </div>

          <button onClick={Logout} id="logout">
            <FontAwesomeIcon
              icon={faRightFromBracket}
              className="custom-white"
            />
          </button>
        </div>
      </div>
    </div>
  );
};
