import * as Yup from "yup";

export const CuentaFormSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Campo obligatorio"),
  apellidos: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Campo obligatorio"),
  num_tarjeta: Yup.string()
    .matches(
      /^(\d{13,19}|\d{16}|\d{10,12}|\d{18})$/,
      "El número debe ser una tarjeta de crédito (13-19 dígitos), tarjeta de débito (16 dígitos), cuenta bancaria (10-12 dígitos), o clabe interbancaria (18 dígitos)."
    )
    .required("Campo obligatorio"),
  tipo: Yup.string().required("Campo obligatorio"),
  banco: Yup.string().required("Campo obligatorio"),
  rfc: Yup.string()
    .matches(/^([A-ZÑ&]{3,4})(\d{6})([A-Z0-9]{3})$/, "Formato de RFC inválido")
    .required("Campo obligatorio"),
  curp: Yup.string()
    .matches(
      /^([A-ZÑ]{1}[AEIOU]{1}[A-ZÑ]{2})(\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01]))([HM]{1})([A-Z]{2})([B-DF-HJ-NP-TV-Z]{3})([A-Z\d]{1})(\d{1})$/,
      "Formato de CURP inválido"
    )
    .required("Campo obligatorio"),
  estatus: Yup.boolean().required("Campo obligatorio"),
});
