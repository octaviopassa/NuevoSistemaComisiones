import React from "react";
import { useGastosData } from "../../store";
import { useUserSession } from "../../../../store";
import { DocumentosService } from "../../../../services";
import toastr from "toastr";
import { format } from "date-fns";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

export const CancelarButton = ({ setLoading }) => {
  const { session } = useUserSession();
  const { estatus, setEstatus, folio, plazaSeleccionada } = useGastosData();
  const MySwal = withReactContent(Swal);

  const handleCancelado = async () => {
    const data = {
      folio,
      cod_usu: session.profile.COD_USU,
      servidor: session.profile.servidor,
    };

    const result = await MySwal.fire({
      title: "¿Deseas cancelar el gasto?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, cancelar",
      cancelButtonText: "No",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setLoading(true);
      const cancelado = await DocumentosService.cancelarGasto(data);

      if (!cancelado.isValid) {
        toastr.error(cancelado.message || "Error al cancelar el gasto");
        console.log(cancelado.message);
        return;
      }

      const gasto = await DocumentosService.getGastoGlobal({
        ...data,
        plaza: plazaSeleccionada,
      });

      setEstatus({
        ...estatus,
        estatus: "CANCELADO",
        cancelo: `${gasto.data[0].NOM_USU_CANCELO} - ${format(
          new Date(gasto.data[0].FECHA_CANCELACION),
          "dd/MM/yyyy"
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
