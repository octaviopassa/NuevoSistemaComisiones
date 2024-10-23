import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserLenguageStore = create(
  persist(
    (set, get) => ({
      userLenguage: "es", // Valor inicial del estado

      // Función para actualizar el estado de isLogged
      setUserLenguage: (lenguage) => {
        set({ userLenguage: lenguage });
      },
      resetUserLenguage: () => {
        set({ userLenguage: "es" });
      },
    }),
    { name: "userLenguage" }
  )
);

export default useUserLenguageStore;
