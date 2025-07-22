import { format } from "date-fns";
import { create } from "zustand";
// import { persist } from "zustand/middleware";

export const useGastosData = create(
  // persist(
  (set, get) => ({
    plazaSeleccionada: "",
    setPlazaSeleccionada: (nuevaPlaza) =>
      set({ plazaSeleccionada: nuevaPlaza }),

    proyectoSeleccionado: "",
    setProyectoSeleccionado: (nuevoProyecto) =>
      set({ proyectoSeleccionado: nuevoProyecto }),

    rfcEmpresaResponsablePagoSeleccionada: "",
    setRfcEmpresaResponsablePagoSeleccionada: (rfc) =>
      set({ rfcEmpresaResponsablePagoSeleccionada: rfc }),

    isCheckedSucursal: true,
    toggleCheckedSucursal: () =>
      set((state) => ({
        isCheckedSucursal: !state.isCheckedSucursal,
      })),

    documentos: [],
    setDocumentos: (nuevosDocumentos) => set({ documentos: nuevosDocumentos }),

    pagarASeleccionado: "",
    setPagarASeleccionado: (nuevoPagarA) =>
      set({ pagarASeleccionado: nuevoPagarA }),

    selectedIngeniero: "",
    setSelectedIngeniero: (nuevoIngeniero) =>
      set({ selectedIngeniero: nuevoIngeniero }),

    gastosDate: format(new Date(), "yyyy-MM-dd"),
    setGastosDate: (nuevaFecha) => set({ gastosDate: nuevaFecha }),

    folio: "GC-000010",
    setFolio: (nuevoFolio) => set({ folio: nuevoFolio }),

    empresa: "",
    setEmpresa: (nuevaEmpresa) => set({ empresa: nuevaEmpresa }),

    rfcEmpresaResponsablePagoSeleccionada: "",
    setRfcEmpresaResponsablePagoSeleccionada: (rfc) =>
      set({ rfcEmpresaResponsablePagoSeleccionada: rfc }),

    estatus: {
      estatus: "Nuevo",
      grabo: "",
      aplico: "",
      autorizo: "",
      observaciones: "",
      propietario: true,
      cancelado: "",
      oldFolio: false,
    },
    setEstatus: (nuevoEstatus) => set({ estatus: nuevoEstatus }),

    resumen: [],
    setResumen: (nuevoResumen) => set({ resumen: nuevoResumen }),

    resetData: () => {
      set({
        plazaSeleccionada: "",
        isCheckedSucursal: true,
        proyectoSeleccionado: "",
        documentos: [],
        empresa: "",
        pagarASeleccionado: "",
        selectedIngeniero: "",
        gastosDate: format(new Date(), "yyyy-MM-dd"),
        folio: "",
        estatus: {
          estatus: "Nuevo",
          grabo: "",
          aplico: "",
          autorizo: "",
          observaciones: "",
          propietario: true,
          cancelado: "",
          oldFolio: false,
        },
        rfcEmpresaResponsablePagoSeleccionada: "",
        resumen: [],
      });
    },

    setMultiple: (nuevosDatos) => {
      set(nuevosDatos);
    },
  })
  //   {
  //     name: "global-data-fetch",
  //     getStorage: () => localStorage,
  //   }
  // )
);
