import { create } from "zustand";
import { persist } from "zustand/middleware";

const userDefault = {
  _id: undefined,
  profile: {
    estatus: undefined,
    idioma: undefined,
    nombre: undefined,
    nombreCompleto: undefined,
    path: undefined,
    rol: undefined,
  },
  username: undefined,
};

export const useUserSession = create(
  persist(
    (set, get) => ({
      session: userDefault, // Valor inicial del estado

      // Función para actualizar el estado de isLogged
      setUserSession: (usuario) => {
        set({ session: usuario });        
      },
      resetUserSession: () => {
        set({ session: userDefault });
      },
    }),
    { name: "userSession" }
  )
);

export default useUserSession;