import { format } from "date-fns";
import { create } from "zustand";
import { subMonths } from "date-fns";

export const useFiltersStore = create(
  (set, get) => ({
    filters: {
      plaza: "",
      usarFiltroFecha: true,
      fechaInicio: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      fechaFin: format(new Date(), "yyyy-MM-dd"),
      estatus: "G",
      vendedor: "",
    },
    setFilters: (nuevosFiltros) => set({ filters: { ...get().filters, ...nuevosFiltros } }),
    resetFilters: () =>
      set({
        filters: {
          plaza: "",
          usarFiltroFecha: true,
          fechaInicio: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
          fechaFin: format(new Date(), "yyyy-MM-dd"),
          estatus: "G",
          vendedor: "",
        },
      }),
  })
);
