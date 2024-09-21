import React, { useState } from "react";
import { useGastosData } from "../store";
import { useUserSession } from "../../../store";
import { ModalLoading } from "../../../components/global/ModalLoading";
import toastr from "toastr";

export const GastosActions = () => {
  const [loading, setLoading] = useState(false);
  const {
    documentos,
    plazaSeleccionada,
    pagarASeleccionado,
    selectedIngeniero,
    gastosDate,
    folio,
    estatus,
  } = useGastosData();
  const { session } = useUserSession();
  console.log(session);
  const totalImportes = documentos.reduce(
    (sumaTotales, documento) => {
      const importes = documento.importes;

      sumaTotales.subtotal += parseFloat(importes.subtotal || 0);
      sumaTotales.total += parseFloat(importes.total || 0);
      sumaTotales.impuesto += parseFloat(importes.impuesto || 0);
      sumaTotales.iva_16 += parseFloat(importes.iva_16 || 0);
      sumaTotales.iva_8 += parseFloat(importes.iva_8 || 0);
      sumaTotales.ieps += parseFloat(importes.ieps || 0);
      sumaTotales.ish += parseFloat(importes.ish || 0);
      sumaTotales.tua += parseFloat(importes.tua || 0);
      sumaTotales.ret += parseFloat(importes.ret || 0);

      return sumaTotales;
    },
    {
      subtotal: 0,
      total: 0,
      impuesto: 0,
      iva_16: 0,
      iva_8: 0,
      ieps: 0,
      ish: 0,
      tua: 0,
      ret: 0,
    }
  );

  const handleGrabado = async (e) => {
    //TODO: Usar estatos.estatus para dependiendo si es nuevo o grabado ver si se manda la accion de EDITAR o INSERTAR.
    e.preventDefault();
    try {
      setLoading(true);
      const dataGastoGlobal = {
        plaza: plazaSeleccionada,
        pagarA: pagarASeleccionado,
        origen: selectedIngeniero === "" ? "S" : "I",
        ingeniero: selectedIngeniero,
        gastosDate,
        folio,
        observaciones: estatus.observaciones,
        cod_usu: session.profile.COD_USU,
        ...totalImportes,
        iva: totalImportes.iva_16 + totalImportes.iva_8,
        // falta el RFC
      };

      const { observaciones, ...dataToValidate } = dataGastoGlobal;

      const areFieldsValid = Object.values(dataToValidate).every(
        (value) => value !== "" && value !== null && value !== undefined
      );

      if (!areFieldsValid) {
        toastr.warning("Por favor, llene todos los campos requeridos.");
        return;
      }

      console.log(dataGastoGlobal);

      const dataDetalle = {};

      await new Promise((resolve) => setTimeout(resolve, 3000));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row mt-3 text-center">
      <div className="col-sm-12">
        <button
          type="button"
          className="btn btn-warning bg-warning-900color-warning-900
              waves-effect waves-themed text-white mr-2"
        >
          <i className="fal fa-search"></i> Consultar
        </button>
        <button
          type="button"
          className="btn btn-primary waves-effect waves-themed mr-2"
        >
          <i className="fal fa-plus"></i> Nuevo
        </button>
        <button
          type="button"
          className="btn btn-success waves-effect waves-themed"
          onClick={handleGrabado}
        >
          <i className="fal fa-save"></i> Guardar
        </button>
        <button
          type="button"
          className="btn btn-secondary bg-warning-900color-warning-900
              waves-effect waves-themed text-white ml-2 mr-2"
        >
          <i className="fal fa-print"></i> Imprimir
        </button>
        <button
          type="button"
          className="btn btn-info waves-effect waves-themed mr-2"
        >
          <i className="fal fa-check"></i> Autorizar
        </button>
        <button
          type="button"
          className="btn btn-danger waves-effect waves-themed"
        >
          <i className="fal fa-ban"></i> Cancelar
        </button>
      </div>

      <ModalLoading
        title=""
        message="Por favor espere..."
        isOpen={loading}
        toggle={() => {}}
      />
    </div>
  );
};
