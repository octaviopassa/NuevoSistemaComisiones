import React from "react";
import toastr from "toastr";

function CopiarAlPortapapeles(data) {
  const copiarTextoAlPortapapeles = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      toastr.success("Ahora está en su portapapeles", "Copiado Correctamente");
    } catch (error) {
      toastr.warning("Algo salió mal con el copiado", "Error al copiar");
    }
  };

  return (
    <button
      className="btn btn-primary btn-xs"
      onClick={() => copiarTextoAlPortapapeles(data.texto)}
    >
      <i className="fal fa-copy"> Copiar</i>
    </button>
  );
}

export default CopiarAlPortapapeles;
