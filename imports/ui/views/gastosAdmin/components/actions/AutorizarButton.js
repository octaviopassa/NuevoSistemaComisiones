import React, { useEffect, useState } from "react";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import toastr from "toastr";
import { useFiltersStore } from "../../store";

export const AutorizarButton = ({ gasto }) => {
  const { session } = useUserSession();
  const [gastos, setGastos] = useState([]);
  const { filters } = useFiltersStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGastos();
  }, [filters]);

  const getGastos = async () => {
    if (!filters.estatus || !filters.plaza) {
      if (gastos.length > 0) {
        toastr.warning("Estatus y Plaza son obligatorios");
        setGastos([]);
        return;
      }
      return;
    }

    const fechaInicio = filters.usarFiltroFecha ? formatDate(filters.fechaInicio) : null;
    const fechaFin = filters.usarFiltroFecha ? formatDate(filters.fechaFin) : null;

    const data = {
      ...filters,
      vendedor: filters.vendedor || "0",
      fechaInicio,
      fechaFin,
      cod_usu: session.profile.TIENE_ACCESO_VER_TODOS_GASTOS
        ? "0"
        : session.profile.COD_USU,
      servidor: session.profile.servidor,
    };

    try {
      setLoading(true);
      const consultaResponse = await GastosService.consultar(data);

      setGastos(consultaResponse.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

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

      getGastos();

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
