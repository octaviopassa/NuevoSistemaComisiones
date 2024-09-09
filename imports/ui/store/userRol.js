import { create } from "zustand";
import { persist } from "zustand/middleware";

// Define el store usando Zustand
const useUserRolStore = create(
  persist(
    (set, get) => ({
      rol: undefined, // Valor inicial del estado

      // Función para actualizar el estado de isLogged
      setUserRol: (rolName) => {
        set({ rol: rolName });
      },
      resetUserRol: () => {
        set({ rol: undefined });
      },
    }),
    { name: "userRol" }
  )
);

export default useUserRolStore;
