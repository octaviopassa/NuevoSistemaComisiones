import * as Yup from "yup";

export const ProveedorFormSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Campo obligatorio"),
  rfc: Yup.string()
    .matches(
      /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/,
      "Formato de RFC inválido"
    )
    .required("Campo obligatorio"),
});
