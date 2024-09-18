import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserLoggedStore = create(
  persist(
    (set, get) => ({
      isLogged: false, // Valor inicial del estado

      // Funciones para actualizar el estado de isLogged
      setUserLogged: (loggedIn) => {
        set({ isLogged: loggedIn });
      },
      resetUserLogged: () => {
        set({ isLogged: false });
      },
    }),
    { name: "isLogged" }
  )
);

export default useUserLoggedStore;
