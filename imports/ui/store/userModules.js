import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserModulesStore = create(
  persist(
    (set, get) => ({
      allowedModules: [], // Valor inicial del estado

      // Función para actualizar el estado de isLogged
      setAllowedModules: (allowedModulesArray) => {
        set({ allowedModules: allowedModulesArray });
      },
      resetAllowedModules: () => {
        set({ allowedModules: [] });
      },
    }),
    { name: "allowedModules" }
  )
);

export default useUserModulesStore;
