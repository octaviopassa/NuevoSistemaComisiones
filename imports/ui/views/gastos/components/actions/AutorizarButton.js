import React from "react";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import { format } from "date-fns";
import toastr from "toastr";

export const AutorizarButton = ({ setLoading }) => {
  const { session } = useUserSession();
  const { setEstatus, folio, estatus, plazaSeleccionada } = useGastosData();
  const handleAutorizado = async () => {
    const data = {
      folio,
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

      const gasto = await DocumentosService.getGastoGlobal({
        plazaSeleccionada,
        ...data,
      });

      setEstatus({
        ...estatus,
        estatus: "AUTORIZADO",
        autorizo: `${gasto.data[0].NOM_USU_AUTORIZO} ${format(
          new Date(gasto.data[0].FECHA_AUTORIZACION),
          "dd/MM/yyyy"
        )}`,
      });
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
