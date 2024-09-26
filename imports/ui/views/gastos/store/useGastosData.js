import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGastosData = create(
  persist(
    (set, get) => ({
      plazaSeleccionada: "",
      setPlazaSeleccionada: (nuevaPlaza) =>
        set({ plazaSeleccionada: nuevaPlaza }),

      documentos: [],
      setDocumentos: (nuevosDocumentos) =>
        set({ documentos: nuevosDocumentos }),

      pagarASeleccionado: "",
      setPagarASeleccionado: (nuevoPagarA) =>
        set({ pagarASeleccionado: nuevoPagarA }),

      selectedIngeniero: "",
      setSelectedIngeniero: (nuevoIngeniero) =>
        set({ selectedIngeniero: nuevoIngeniero }),

      gastosDate: "",
      setGastosDate: (nuevaFecha) => set({ gastosDate: nuevaFecha }),

      folio: "",
      setFolio: (nuevoFolio) => set({ folio: nuevoFolio }),

      estatus: {
        estatus: "Nuevo",
        grabo: "",
        aplico: "",
        autorizo: "",
        observaciones: "",
        propietario: false,
        cancelado: "",
      },
      setEstatus: (nuevoEstatus) => set({ estatus: nuevoEstatus }),

      resumen: [],
      setResumen: (nuevoResumen) => set({ resumen: nuevoResumen }),

      resetData: () => {
        set({
          plazaSeleccionada: "",
          documentos: [],
          pagarASeleccionado: "",
          selectedIngeniero: "",
          gastosDate: "",
          folio: "",
          estatus: {
            estatus: "Nuevo",
            grabo: "",
            aplico: "",
            autorizo: "",
            observaciones: "",
            propietario: false,
            cancelado: "",
          },
          resumen: [],
        });
      },
    }),
    {
      name: "global-data-fetch",
      getStorage: () => sessionStorage,
    }
  )
);
