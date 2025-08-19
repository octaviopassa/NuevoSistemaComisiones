import React from "react";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import toastr from "toastr";
import { formatDate } from "../../../../../utils/utils";

export const AplicarButton = ({ setLoading }) => {
  const { session } = useUserSession();
  const { setEstatus, folio, estatus, plazaSeleccionada } = useGastosData();
  const handleAplicar = async () => {
    const data = {
      folio,
      cod_usu: session.profile.COD_USU,
      servidor: session.profile.servidor,
    };

    try {
      setLoading(true);
      const aplicado = await DocumentosService.aplicarGasto(data);

      if (!aplicado.isValid) {
        toastr.error(aplicado.message || "Error al aplicar el gasto");
        return;
      }

      const gasto = await DocumentosService.getGastoGlobal({
        folio: data.folio,
        plaza: plazaSeleccionada,
        cod_usu: session.profile.COD_USU,
        servidor: session.profile.servidor
      });

      setEstatus({
        ...estatus,
        estatus: "APLICADO",
        aplico: `${gasto.data[0].NOM_USU_APLICO} ${formatDate(gasto.data[0].FECHA_APLICACION)}`,
      });

      toastr.success("Se ha aplicado la comisión.");
    } catch (error) {
      console.log(error, error?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="btn btn-danger waves-effect waves-themed mr-2"
      onClick={handleAplicar}
    >
      <i className="fal fa-check-circle"></i> Aplicar
    </button>
  );
};
