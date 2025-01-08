import moment from "moment";
import "moment-duration-format";
import { format } from "date-fns";

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

export const formatToSinaloaDate = (date) => {
  const timeZone = "America/Mazatlan"; // Zona horaria de Sinaloa
  const options = { timeZone, year: "numeric", month: "2-digit", day: "2-digit" };

  // Si es una cadena, conviértela a Date
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  // Formatear la fecha a 'yyyy-MM-dd' en la zona horaria de Sinaloa
  const formatter = new Intl.DateTimeFormat("en-CA", options); // 'en-CA' asegura 'yyyy-MM-dd'
  const [month, day, year] = formatter.format(parsedDate).split("/");

  return `${year}-${month}-${day}`;  
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

export function extraerRFC(cadena) {
  const regex = /\(([^)]+)\)/; // Expresión regular para encontrar texto entre paréntesis
  const resultado = regex.exec(cadena);
  return resultado ? resultado[1] : false; // Devuelve el RFC si se encuentra, o null si no
}

export function validarMesYAnio(fechaVariable, fechaAValidar) {
  // Convertir ambas fechas de string a objetos Date
  const [diaVar, mesVar, anioVar] = fechaVariable.split("/").map(Number);
  const [diaVal, mesVal, anioVal] = fechaAValidar.split("/").map(Number);

  // Crear objetos Date para las fechas
  const fecha1 = new Date(anioVar, mesVar - 1, diaVar); // -1 porque los meses en JavaScript van de 0 a 11
  const fecha2 = new Date(anioVal, mesVal - 1, diaVal);

  // Comparar mes y año de ambas fechas
  return (
    fecha1.getMonth() === fecha2.getMonth() &&
    fecha1.getFullYear() === fecha2.getFullYear()
  );
}
