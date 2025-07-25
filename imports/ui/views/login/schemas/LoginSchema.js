import * as yup from "yup";

export const LoginSchema = yup.object().shape({
  user: yup
    .string()
    .required("El usuario es obligatorio")
    .min(2, "El usuario debe tener al menos 3 caracteres"),
  password: yup
    .string()
    .required("La contraseña es obligatoria")
    .min(3, "La contraseña debe tener al menos 3 caracteres"),
});
