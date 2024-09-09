import React from "react";
import { useTranslation } from "react-i18next";

export const Subheader = ({ data }) => {
  const { t } = useTranslation();
  if (data.breadcrumbs) {
    return (
      <div>
        <ol className="breadcrumb page-breadcrumb">
          <li className="breadcrumb-item">
            <a href="/">{t("breadcrumbs")}</a>
          </li>
          <li className="breadcrumb-item">{data.breadcrumbs[0]}</li>
          <li className="breadcrumb-item">{data.breadcrumbs[1]}</li>
          <li className="breadcrumb-item active">{data.breadcrumbs[2]}</li>
          <li className="position-absolute pos-top pos-right d-none d-sm-block">
            <span className="js-get-date"></span>
          </li>
        </ol>
        <div className="subheader">
          <h1 className="subheader-title">
            <i className={"subheader-icon " + data.icono}></i> {data.titulo}{" "}
            <span className="fw-300">{data.subTitulo}</span>{" "}
            <sup className="badge badge-primary fw-500">{data.etiqueta}</sup>
            <small>{data.descripcion}</small>
          </h1>
          <div className="subheader-block">{data.derecha}</div>
        </div>
      </div>
    );
  } else {
    return <div></div>;
  }
};
