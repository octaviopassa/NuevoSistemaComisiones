import React, { useState } from "react";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import toastr from "toastr";
import { useFiltersStore } from "../../store";

export const AutorizarButton = ({ gasto }) => {
  const { session } = useUserSession();
  const [loading, setLoading] = useState(false);
  const { filters, setFilters } = useFiltersStore();

  const handleAutorizado = async () => {
    const data = {
      folio: gasto.FOLIO_GASTO,
      cod_usu: session.profile.COD_USU,
      servidor: session.profile.servidor,
    };

    try {
      setLoading(true);
      const autorizado = await DocumentosService.autorizarGasto(data);

      if (!autorizado.isValid) {
        toastr.error(autorizado.message || "Error al autorizar el gasto");
        return;
      }

      setFilters({ ...filters, recargarDespuesDeAutorizar: true });

      toastr.success("Se ha autorizado el gasto");
    } catch (error) {
      console.log(error, error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-info waves-effect waves-themed mr-2"
      onClick={handleAutorizado}
    >
      <i className="fal fa-check"></i> Autorizar
    </button>
  );
};
