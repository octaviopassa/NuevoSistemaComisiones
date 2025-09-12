import * as Yup from "yup";

export const RepresentantesFormSchema = Yup.object().shape({
  nombre_representante: Yup.string()
    .min(2, "Mínimo 2 caracteres")
    .max(100, "Máximo 100 caracteres")
    .required("Campo obligatorio"),
  porcentaje_comision: Yup.number().min(1, "Mínimo 1").max(100, "Máximo 100").required("Campo obligatorio"),
  cod_zona: Yup.string().required("Campo obligatorio"),
  estatus: Yup.boolean().required("Campo obligatorio"),
});
