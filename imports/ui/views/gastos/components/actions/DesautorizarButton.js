import React from "react";
import { useGastosData } from "../../store";
import { DocumentosService } from "../../../../services";
import toastr from "toastr";
import { useUserSession } from "../../../../store";

export const DesautorizarButton = ({ setLoading }) => {
  const { estatus, setEstatus, folio } = useGastosData();
  const { session } = useUserSession();

  const handleDesautorizado = async () => {
    const data = {
      folio,
    };
    try {
      setLoading(true);
      const desautorizado = await DocumentosService.desautorizarGasto(data);
      if (!desautorizado.isValid) {
        toastr.error(desautorizado.message || "Error al desautorizar el gasto");
        return;
      }

      setEstatus({ ...estatus, estatus: "GRABADO", autorizo: "" });

      toastr.success("Se ha desautorizado el gasto");
    } catch (error) {
      console.log(error, error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-warning waves-effect waves-themed mr-2"
      disabled={!session.profile.DESAUTORIZAR_GASTOS}
      onClick={handleDesautorizado}
    >
      <i className="fal fa-check"></i> Desautorizar
    </button>
  );
};
