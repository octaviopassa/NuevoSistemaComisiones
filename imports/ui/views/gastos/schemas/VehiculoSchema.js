import * as Yup from "yup";

export const VehiculoFormSchema = Yup.object().shape({
  nombre: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Campo obligatorio"),
  placa: Yup.string()
    .min(5, "Muy corto")
    .max(9, "Muy largo")
    .required("Campo obligatorio"),
  modelo: Yup.string()
    .min(2, "Muy corto")
    .max(50, "Muy largo")
    .required("Campo obligatorio"),
  numero_serie: Yup.string().max(30, "Muy largo"),
  numero_poliza: Yup.string().max(30, "Muy largo"),
  conductor: Yup.string().required("Campo obligatorio"),
});
