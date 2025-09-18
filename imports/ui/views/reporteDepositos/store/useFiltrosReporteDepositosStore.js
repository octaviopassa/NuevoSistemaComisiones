import { format } from "date-fns";
import { create } from "zustand";
import { subMonths } from "date-fns";

export const useFiltrosReporteDepositosStore = create(
  (set, get) => ({
    filters: {
      codigoRepresentante: "",
      fecha1_Comision: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      fecha2_Comision: format(new Date(), "yyyy-MM-dd"),
    },
    setFilters: (nuevosFiltros) => set({ filters: { ...get().filters, ...nuevosFiltros } }),
    resetFilters: () =>
      set({
        filters: {
          codigoRepresentante: "",
          fecha1_Comision: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
          fecha2_Comision: format(new Date(), "yyyy-MM-dd"),
        },
      }),
  })
);
