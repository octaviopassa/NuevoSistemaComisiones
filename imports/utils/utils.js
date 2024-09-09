import moment from "moment";
import "moment-duration-format";

export function formatCurrency(value, locale = "es-MX", currency = "MXN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

export const formatDate = (dateString) => {
  if (dateString) {
    const options = {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(dateString)
      .toLocaleString("es", options)
      .replace(/\//g, "-");
  } else {
    return "Sin fecha";
  }
};

export const formatDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return "Duración no disponible";

  // Crear momentos para el inicio y el fin
  const start = moment(startTime);
  const end = moment(endTime);

  // Calcular la duración
  const duration = moment.duration(end.diff(start));

  // Formatear y devolver la duración
  // Esto devolverá un formato como "2 horas 34 minutos 56 segundos"
  return duration.format("d [dias] h [horas] m [minutos] s [segundos]");
};

export const estatusPago = (estatus) => {
  let claseNombre;
  let estatusNombre;

  switch (estatus) {
    case 1:
      claseNombre = "badge badge-primary";
      estatusNombre = "Enviado";
      break;
    case 2:
      claseNombre = "badge badge-warning";
      estatusNombre = "Pendiente";
      break;
    case 3:
      claseNombre = "badge badge-success";
      estatusNombre = "Pagado";
      break;
    case 4:
      claseNombre = "badge badge-danger";
      estatusNombre = "Cancelado";
      break;
    default:
      claseNombre = "badge badge-secondary";
      estatusNombre = "Desconocido";
  }

  return [claseNombre, estatusNombre];
};
