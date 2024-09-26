import React from "react";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import toastr from "toastr";

export const CancelarButton = ({ setLoading }) => {
  const { session } = useUserSession();
  const { estatus, setEstatus, folio, plazaSeleccionada } = useGastosData();

  const handleCancelado = async () => {
    const data = {
      folio,
      cod_usu: session.profile.COD_USU,
    };

    try {
      setLoading(true);
      const cancelado = await DocumentosService.cancelarGasto(data);

      if (!cancelado.isValid) {
        toastr.error(cancelado.message || "Error al cancelar el gasto");
        return;
      }

      const gasto = await DocumentosService.getGastoGlobal({
        plazaSeleccionada,
        ...data,
      });

      setEstatus({
        ...estatus,
        estatus: "CANCELADO",
        cancelo: `${gasto.data[0].NOM_USU_CANCELO} - ${format(
          new Date(gasto.data[0].FECHA_CANCELACION)
        )}`,
      });
      toastr.success("Se ha cancelado el gasto");
    } catch (error) {
      console.log(error, error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-danger waves-effect waves-themed"
      onClick={handleCancelado}
    >
      <i className="fal fa-ban"></i> Cancelar
    </button>
  );
};
