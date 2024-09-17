import * as Yup from "yup";

export const ConductorFormSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Campo obligatorio"),
});
