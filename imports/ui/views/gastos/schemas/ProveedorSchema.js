import * as Yup from "yup";

export const ProveedorFormSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Campo obligatorio"),
  rfc: Yup.string()
    .matches(/^([A-ZÑ&]{3,4})(\d{6})([A-Z0-9]{3})$/, "Formato de RFC inválido")
    .required("Campo obligatorio"),
});
