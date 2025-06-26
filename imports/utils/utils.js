import moment from "moment";
import "moment-duration-format";
import { format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatCurrency(value, locale = "es-MX", currency = "MXN") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
}

export function formatNumConComas(value, locale = 'es-MX', decimals = 2) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export const formatDateUser = (dateString) => {
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

/**
 * Formatea una fecha en formato "yyyy-MM-dd" a la zona horaria de Sinaloa (America/Mazatlan)
 * @param {*} date 
 * @returns 
 */
export const formatToSinaloaDate = (date) => {
  if (!date) return "";
  try {
    const timeZone = "America/Mazatlan"; // Zona horaria de Sinaloa       
    // Si es una cadena, convierte a Date
    const parsedDate = typeof date === "string" ? parseISO(date) : date;
    // Formatear la fecha directamente en la zona horaria de Sinaloa
    return formatInTimeZone(parsedDate, timeZone, "dd/MM/yyyy");
  } catch (error) {
    console.error("Error al formatear fecha:", error);
    return date; // Retornar la fecha original si hay error
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "Sin fecha";

  // Formatos que queremos intentar parsear
  const formatos = [
    "YYYY-MM-DDTHH:mm:ss",
    "YYYY-MM-DDTHH:mm:ss.S",
    "YYYY-MM-DDTHH:mm:ss.SS",
    "YYYY-MM-DDTHH:mm:ss.SSS",
    "YYYY-MM-DD:HH:mm:ss",
    "YYYY-MM-DD",
    "DD/MM/YYYY"
  ];

  // Intentar parsear la fecha con los diferentes formatos
  const fechaMoment = moment(dateString, formatos, true);

  // Si la fecha es válida, la formateamos al formato deseado
  if (fechaMoment.isValid()) {
    return fechaMoment.format("DD/MM/YYYY");
  }

  // Si no se pudo parsear con ningún formato, retornamos un mensaje de error
  console.error("Error al formatear fecha:", dateString);
  return "Formato inválido";
};

/**
 * Recibe dos fechas en formato "yyyy-MM-dd HH:mm:ss" y devuelve la duración en horas, minutos y segundos
 * @param {*} startTime 
 * @param {*} endTime 
 */
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

export const validarMismoMesAnioDocumentosIANSA = (documentosExistentes, fechaFormateada) => {
  if (!documentosExistentes || documentosExistentes.length === 0) return true;

  const [diaVar, mesVar, anioVar] = fechaFormateada.split("/").map(Number);
  const fechaNuevoXML = new Date(anioVar, mesVar - 1, diaVar); // -1 porque los meses en JavaScript van de 0 a 11  
  const mesNuevoXML = fechaNuevoXML.getMonth();
  const anioNuevoXML = fechaNuevoXML.getFullYear();

  // Ordenamos documentosExistentes por ID en orden ascendente
  const sortedDocumentos = documentosExistentes.slice().sort((a, b) => a.id - b.id);

  // Crear un Map con los ids y fechas de los documentos existentes
  const documentoMap = new Map(sortedDocumentos.map(documento => [documento.id, formatDate(documento.fecha)]));

  //Sacamos la primera entrada del map para comparar
  const firstEntry = documentoMap.entries().next().value;
  const [diaVal, mesVal, anioVal] = firstEntry[1].split("/").map(Number);
  const fechaValida = new Date(anioVal, mesVal - 1, diaVal);
  const mesValido = fechaValida.getMonth();
  const anioValido = fechaValida.getFullYear();

  // Verificar que el mes y año del documento que intentan subir sea igual al mes y año de los documentos existentes
  if (mesValido !== mesNuevoXML || anioValido !== anioNuevoXML) {
    return false;
  }
  return true;
};

export function limpiarCadenaXML(cadena_xml) {
  return cadena_xml
    .replace(/<\?xml.*?\?>\s*/g, '') // Elimina la declaración XML y espacios en blanco posteriores
    .replace(/^[^<]*/, '')              // Elimina todo lo que está antes del primer '<'
    .replace(/'/g, '')                  // Elimina todas las comillas simples
    .trim();                            // Elimina espacios al inicio y al final
};

export function limpiarBase64XML(base64xml, reencode = true) {
  //Esta función sirve para limpiar los archivos que YA han sido guardados en la BD
  if (typeof base64xml !== 'string') return base64xml;
  try {
    // Decodifica el base64 a texto
    const decoded = Buffer.from(base64xml, 'base64').toString('utf8');
    // Limpia el XML igual que la función limpiarCadenaXML
    const cleaned = decoded
      .replace(/<\?xml.*?\?>\s*/g, '')
      .replace(/^[^<]*/, '')
      .replace(/'/g, '')
      .trim();
    // Si se pide, vuelve a codificar en base64, si no, devuelve el texto limpio
    return reencode ? Buffer.from(cleaned, 'utf8').toString('base64') : cleaned;
  } catch (e) {
    // Si falla la decodificación, regresa el original    
    console.log('Error en limpiarBase64XML', e);
    return base64xml;
  }
};

export function limpiarBase64XMLEnMemoria(base64xml) {
  //Esta función sirve para limpiar los archivos que NO han sido guardados en la BD
  if (typeof base64xml !== 'string') return base64xml;
  try {
    // Decodifica el base64 a texto usando atob (navegador)
    const decoded = atob(base64xml);
    // Limpia el XML igual que la función limpiarCadenaXML
    const cleaned = decoded
      .replace(/<\?xml.*?\?>\s*/g, '')
      .replace(/^[^<]*/, '')
      .replace(/'/g, '')
      .trim();
    // Siempre vuelve a codificar en base64 usando btoa
    return btoa(cleaned);
  } catch (e) {
    console.log('Error en limpiarBase64XMLEnMemoria', e);
    return base64xml;
  }
};

export const version = () => {
  return "1.0.9";
};