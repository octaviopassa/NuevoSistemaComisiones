import React, { useEffect } from "react";
import Swal from "sweetalert2";

export default function loadingModal(state) {
  if (state) {
    Swal.fire({
      title: false,
      imageUrl: "loading/loadingt.gif",
      imageWidth: 100,
      imageHeight: 100,
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        background: "transparent", // Agrega una clase de fondo transparente
        popup: "classModalPop", // Clase personalizada para el popup si es necesario
      },
      backdrop: `
        rgba(136, 106, 181, 0.5)
        left top
        no-repeat
      `,
    });
  } else {
    Swal.close();
  }
}
