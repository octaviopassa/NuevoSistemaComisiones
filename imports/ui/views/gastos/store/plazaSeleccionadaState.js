import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePlazaStore = create(
  persist(
    (set) => ({
      plazaSeleccionada: "",
      setPlazaSeleccionada: (nuevaPlaza) => set({ plazaSeleccionada: nuevaPlaza }),
    }),
    {
      name: "plaza-storage",
      getStorage: () => sessionStorage,
    }
  )
);