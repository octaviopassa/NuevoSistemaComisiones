import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGastosData = create(
  persist(
    (set) => ({
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
    }),
    {
      name: "global-data-fetch",
      getStorage: () => sessionStorage,
    }
  )
);
