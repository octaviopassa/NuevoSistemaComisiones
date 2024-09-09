import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

import NotAllowed from "../../components/global/NotAllowed";
import ModalPageForm from "../../components/pages/pages.modal";
import RolesService from "../../components/roles/roles.service";
import PageService from "../../components/pages/pages.service";
import ProtectModule from "../../components/global/HProtectModule";
import ModalRoles from "../../components/roles/roles.modal";
import Page from "../../components/global/Page";
import { Subheader } from "../../components/global/Subheader";
import { showModal } from "../../components/global/Modal";

function PagesList(props) {
  const [pages, setPages] = useState([]);
  const [Order, setOrder] = useState("ASC");
  const getSorted = (column) => {
    if (order == "ASC") {
      const sorted = [...pages].sort((a, b) =>
        a[column].toLowerCase() > b[column].toLowerCase() ? 1 : -1
      );
      setPages(sorted);
      setOrder("DSC");
    }
    if (order == "DSC") {
      const sorted = [...pages].sort((a, b) =>
        a[column].toLowerCase() < b[column].toLowerCase() ? 1 : -1
      );
      setPages(sorted);
      setOrder("ASC");
    }
  };
  const { t } = useTranslation();
  const subheader = {
    icono: "fal fa-list",
    titulo: t("pages.title"),
    subTitulo: t("pages.subtitle"),
    etiqueta: t("pages.tag"),
    descripcion: t("pages.description"),
    derecha: t("pages.right"),
    breadcrumbs: [
      t("pages.breadcrumbs1"),
      t("pages.breadcrumbs2"),
      t("pages.breadcrumbs3"),
    ],
  };
  const checkFill = (data) => {
    if (data === null || data === undefined || data === "") {
      return "-";
    } else {
      return data;
    }
  };
  const asyncLoad = async () => {
    PageService.getAll().then((response) => {
      setPages(response);
    });
    // setPages(tmp);
  };
  const openModal = (item) => {
    showModal(ModalPageForm, { item, successfulCompletion: asyncLoad });
  };

  useEffect(() => {
    asyncLoad();
  }, []);

  return (
    <Page name="Pages">
      <Subheader data={subheader} />
      <ProtectModule method="remove" module="view" ifNot={<NotAllowed />}>
        <ProtectModule method="remove" module="create" ifNot={<NotAllowed />}>
          <div className="row">
            <div className="col-sm-2">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  openModal();
                }}
              >
                {t("button.new")}
              </button>
            </div>
          </div>
        </ProtectModule>

        <br />

        <table className="table table-bordered tablaResponsiva">
          <thead>
            <tr>
              <th>#</th>
              <th>{t("pages.table.name")}</th>
              <th>{t("pages.table.route")}</th>
              <th className="text-center col-sm-1">
                {t("pages.table.actions")}
              </th>
            </tr>
          </thead>

          <tbody>
            {pages.map((page, idx) => (
              <tr key={idx}>
                <td data-label="#">{idx + 1}</td>
                <td data-label={t("pages.table.name")}>{page.name}</td>
                <td data-label={t("pages.table.route")}>{page.path}</td>
                <td className="text-center">
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => openModal(page)}
                  >
                    <FontAwesomeIcon icon={faPencil} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ProtectModule>
    </Page>
  );
}

export default PagesList;
