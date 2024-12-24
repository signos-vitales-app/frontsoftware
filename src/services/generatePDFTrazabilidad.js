import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";

const friendlyFieldNames = {
  primer_nombre: "Primer nombre",
  segundo_nombre: "Segundo nombre",
  primer_apellido: "Primer apellido",
  segundo_apellido: "Segundo apellido",
  Nombre: "Nombre completo",
  tipo_identificacion: "Tipo de identificación",
  numero_identificacion: "Número de identificación",
  fecha_nacimiento: "Fecha de nacimiento",
  ubicacion: "Ubicación (Habitación)",
  status: "Estado",
  estadoAnterior: "Estado anterior",
  estadoNuevo: "Estado nuevo",
  age_group: "Tipo de Paciente",
  responsable_username: "Responsable del registro del paciente",
  responsable_signos: "Responsable del registro de Signos Vitales",
  responsable: "Responsable de la actualización del registro del paciente",
  created_at: "Fecha de creación",
  record_date: "Fecha de registro",
  record_time: "Hora de registro",
  presion_sistolica: "Presión Sistólica (mmHg)",
  presion_diastolica: "Presión Diastólica (mmHg)",
  presion_media: "Presión Media (mmHg)",
  pulso: "Pulso (lat/min)",
  temperatura: "Temperatura (°C)",
  frecuencia_respiratoria: "Frecuencia Respiratoria (resp/min)",
  saturacion_oxigeno: "Saturación de Oxígeno (%)",
  peso_adulto: "Peso (Adulto) (kg)",
  peso_pediatrico: "Peso (Pediátrico) (kg)",
  talla: "Talla (cm)",
  observaciones: "Observaciones",
};

// Campos a excluir
const excludeKeys = ["id", "id_paciente"];
const shouldExclude = (key, data) =>
  excludeKeys.includes(key) ||
  (key === "peso_adulto" && data.peso_pediatrico) ||
  (key === "peso_pediatrico" && data.peso_adulto);

// Funciones auxiliares
const formatDateOnly = (dateString) => {
  if (!dateString || isNaN(Date.parse(dateString))) {
    return "Fecha no disponible"; // Validar si la fecha es inválida
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()); // Año completo sin truncar

  return `${day}/${month}/${year}`; // Solo fecha sin hora
};

const formatDate = (dateString) => {
  if (!dateString || isNaN(Date.parse(dateString))) return "Fecha no disponible";
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" };
  return new Intl.DateTimeFormat("es-ES", options).format(new Date(dateString));
};

const capitalizeFirstLetter = (str) => {
  const excludeWords = ["de", "del", "la"]; // Palabras a excluir
  return str
    .toLowerCase()
    .split(" ") // Divide en palabras
    .map((word, index) => {
      if (excludeWords.includes(word) && index !== 0) {
        // Si la palabra está en la lista de exclusión y no es la primera, mantener en minúscula
        return word;
      }
      // Capitaliza la primera letra
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" "); // Une las palabras de nuevo
};

const mapFieldName = (key) => {
  const friendlyName = friendlyFieldNames[key];
  return friendlyName ? capitalizeFirstLetter(friendlyName) : capitalizeFirstLetter(key.replace(/_/g, " "));
};

const renderStyledTable = (doc, startY, data, title, marginX) => {
  if (!data || Object.keys(data).length === 0) {
    doc.setFont("Times", "normal");
    doc.text("No hay datos disponibles.", marginX, startY);
    return startY + 10;
  }

  const tableData = []; // Almacena los datos de la tabla

  // Procesar datos y mostrar solo valores nuevos
  Object.entries(data)
    .filter(([key]) => !shouldExclude(key, data) && key !== "paciente")
    .forEach(([key, value]) => {
      let displayValue = value != null && value !== "" ? value : "Sin información"; 

      if (typeof value === "string") {
        displayValue = capitalizeFirstLetter(value); // Aplicar a valores tipo string
      }
      if (key === "tipo_identificacion" && typeof value === "string") {
        displayValue = capitalizeFirstLetter(value);
      } else if (key === "fecha_nacimiento") {
        if (value && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) { // Validar formato DD/MM/YYYY
          const [day, month, year] = value.split("/");
          displayValue = `${day}/${month}/${year}`; // Formato legible (no necesita conversión adicional)
        } else if (value && !isNaN(Date.parse(value))) {
          // Caso: Formato ISO (o similar reconocible por Date.parse)
          const date = new Date(value); // Convertir a objeto Date
          const day = String(date.getDate()).padStart(2, "0");
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const year = date.getFullYear();
          displayValue = `${day}/${month}/${year}`; // Formatear como DD/MM/YYYY
        } else {
          displayValue = "Fecha no disponible";
        }
      } else if (typeof value === "object" && value !== null) {
        if (value.nuevo) {
          displayValue = value.nuevo || "Sin información";
        } else {
          displayValue = Object.entries(value)
            .map(([subKey, subValue]) => `${mapFieldName(subKey)}: ${subValue || "Sin información"}`)
            .join("\n");
        }
      } else if (key.includes("fecha") || (typeof value === "string" && value.includes("T"))) {
        displayValue = formatDateOnly(value);
      }
      displayValue = displayValue || "Sin información";
      tableData.push([mapFieldName(key), displayValue]);
    });
  return renderTable(doc, startY, tableData, title);
};

const renderPatientInfoTable = (doc, startY, patientData, marginX) => {
  const tableData = Object.entries(patientData).map(([key, value]) => [
    mapFieldName(key), value || "Sin información"
  ]);
  const head = [
    [{ content: "Información del Paciente", colSpan: 2, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255 } }]
  ];
  autoTable(doc, {
    startY,
    head: head,
    body: tableData,
    theme: "grid", // Cambiado a "grid" para igualar estilo
    tableWidth: "auto",
    columnStyles: {
      0: { cellWidth: 100, halign: "center", overflow: "hidden" }, // Primera columna centrada y negrita
      1: { cellWidth: 80, halign: "center", overflow: "hidden" }, // Segunda columna centrada
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: "center", // Centra el texto horizontalmente
      valign: "middle", // Centra el texto verticalmente
    },
    headStyles: {
      fillColor: [41, 128, 185], // Fondo azul igual
      textColor: 255, // Texto blanco
      halign: "center",
      valign: "middle",
      overflow: "linebreak",
    },
    alternateRowStyles: { fillColor: [242, 242, 242] }, // Color gris claro para filas alternas
    margin: { left: 15, right: 15 }, // Márgenes ajustados igual
  });
  return doc.lastAutoTable.finalY + 10; // Devuelve la posición Y actualizada
};

// Función para renderizar la tabla de información
const renderTablaConCondicion = (doc, startY, datos, tipoAccion, responsableDescarga) => {
  const titulo = tipoAccion === "Descarga de PDF" ? "Información del Paciente" : "Datos Nuevos";
  const cuerpoTabla = Object.entries(datos).map(([key, value]) => [
    mapFieldName(key), value || "Sin información"
  ]);
  // Agregar "Responsable de la descarga" como última fila si aplica
  if (tipoAccion === "Descarga de PDF" && responsableDescarga) {
    cuerpoTabla.push([
      { content: "Responsable de la descarga", styles: { fontStyle: "bold", fillColor: [230, 247, 255] } },
      { content: responsableDescarga, styles: { fillColor: [230, 247, 255] } }
    ]);
  }
  return renderTable(doc, startY, cuerpoTabla, titulo, true);
};

const renderTable = (doc, startY, body, title = null, showHeadOnce = false) => {
  const head = title
    ? [[{ content: title, colSpan: 2, styles: { halign: "center", fillColor: [41, 128, 185], textColor: 255 } }]]
    : null;
  autoTable(doc, {
    startY,
    head: head,
    body: body,
    theme: "grid",
    tableWidth: "auto",
    columnStyles: {
      0: { cellWidth: 100, halign: "center", overflow: "hidden" }, // Primera columna centrada
      1: { cellWidth: 80, halign: "center", overflow: "hidden" }, // Segunda columna centrada
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: "center",
      valign: "middle",
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      halign: "center",
      valign: "middle",
      overflow: "linebreak",
    },
    alternateRowStyles: { fillColor: [242, 242, 242] },
    margin: { left: 15, right: 15 },
    showHead: showHeadOnce ? "firstPage" : "everyPage",
  });
  return doc.lastAutoTable.finalY + 10;
};

const generatePDFTrazabilidad = async (usuarioInfo, trazabilidadData) => {
  try {
    const doc = new jsPDF();
    const MARGIN_X = 20;
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let startY = 20;

    const calcularRangoFechas = (acciones) => {
      const fechas = acciones.map((accion) => new Date(accion.fecha_hora));
      const fechaInicio = new Date(Math.min(...fechas));
      const fechaFin = new Date(Math.max(...fechas));
      return `${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`;
    };
    const drawReportHeader = () => {
      doc.setFont("Times", "Normal");
      doc.setFontSize(28);
      doc.setTextColor(41, 76, 119);
      doc.text("Reporte de Trazabilidad", pageWidth / 2, startY, { align: "center" });
      startY += 10;
    };
    const drawUserHeader = (usuario, rangoFechas) => {
      drawReportHeader();
      doc.setFillColor(41, 128, 185);
      doc.rect(0, startY, pageWidth, 20, "F");
      doc.setFont("Times", "Normal");
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text(`Acciones realizadas por: ${usuario}`, MARGIN_X, startY + 10);
      doc.text(`Rango de fechas: ${rangoFechas}`, MARGIN_X, startY + 16);
      startY += 28;
    };
    // Agrupar los datos por usuario
    const groupedData = trazabilidadData.reduce((acc, item) => {
      const userName = item.usuario_nombre || "Usuario desconocido";
      if (!acc[userName]) acc[userName] = [];
      acc[userName].push(item);
      return acc;
    }, {});
    let firstPage = true;
    // Recorrer los datos agrupados por usuario
    for (const [usuario, acciones] of Object.entries(groupedData)) {
      const rangoFechas = calcularRangoFechas(acciones);
      let firstActionOfUser = true;

      acciones.forEach((accion, index) => {
        if (!firstPage) {
          doc.addPage();
          startY = 20;
        } else {
          firstPage = false;
        }
        // Dibujar encabezado del usuario solo al inicio de sus acciones
        if (firstActionOfUser) {
          drawUserHeader(usuario, rangoFechas);
          firstActionOfUser = false;
        }
        // Dibuja acción principal
        doc.setFont("Times", "bold");
        doc.setFontSize(14);
        doc.setTextColor(41, 76, 119);
        doc.text(`Acción: ${accion.accion || "Sin acción"}`, MARGIN_X, startY);
        startY += 8;

        doc.setFont("Times", "Normal");
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Fecha y Hora: ${formatDate(accion.fecha_hora)}`, MARGIN_X, startY);
        startY += 6;
        if (accion.responsable) {
          doc.text(`Responsable: ${accion.responsable}`, MARGIN_X, startY);
          startY += 6;
        }
        startY += 5; // Espacio adicional entre acciones
        const datosNuevos = typeof accion.datos_nuevos === "string" ? JSON.parse(accion.datos_nuevos || "{}") : accion.datos_nuevos;
        if (datosNuevos.paciente) {
          startY = renderPatientInfoTable(doc, startY, datosNuevos.paciente, MARGIN_X);
        }
        if (accion.accion === "Descarga de PDF") {
          const responsableDescarga = accion.usuario_nombre || "No especificado";
          startY = renderTablaConCondicion(doc, startY, datosNuevos.paciente || datosNuevos, accion.accion, responsableDescarga);
        } else if (datosNuevos && Object.keys(datosNuevos).length > 0) {
          startY = renderStyledTable(doc, startY, datosNuevos, "Datos Nuevos", "Valores Nuevos", MARGIN_X);
        }
        // Datos Anteriores
        const datosAntiguos = typeof accion.datos_antiguos === "string" ? JSON.parse(accion.datos_antiguos || "{}") : accion.datos_antiguos;
        if (datosAntiguos && Object.keys(datosAntiguos).length > 0) {
          startY = renderStyledTable(doc, startY, datosAntiguos, "Datos Anteriores", "Valores Anteriores", MARGIN_X);
        }
      });
    }

    // Información General al final
    const drawStyledSectionHeader = (title) => {
      doc.setFillColor(41, 128, 185); // Fondo azul fuerte
      doc.roundedRect(MARGIN_X - 10, startY, pageWidth - 2 * MARGIN_X + 20, 14, 4, 4, "F");
      doc.setFont("Times", "Normal");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255); // Texto blanco
      doc.text(title, pageWidth / 2, startY + 9, { align: "center" });
      startY += 24;
    };

    const drawInfoCard = (label, value) => {
      const cardHeight = 16;
      doc.setFillColor(240, 248, 255);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(MARGIN_X, startY, pageWidth - 2 * MARGIN_X, cardHeight, 4, 4, "FD");

      doc.setFont("Times", "Normal");
      doc.setFontSize(14);
      doc.setTextColor(41, 76, 119);
      doc.text(label, MARGIN_X + 8, startY + 10);

      doc.setFont("Times", "Normal");
      doc.setTextColor(0, 0, 0);
      doc.text(value, pageWidth - MARGIN_X - 8, startY + 10, { align: "right" });
      startY += cardHeight + 8;
    };

    const drawHighlightedDate = () => {
      const dateText = `Reporte generado el: ${new Date().toLocaleDateString()}`;
      const dateWidth = doc.getTextWidth(dateText);

      doc.setFillColor(200, 230, 255);
      doc.rect(MARGIN_X, startY + 4, dateWidth + 10, 15, "F");

      doc.setFont("Times", "Normal");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(dateText, MARGIN_X + 5, startY + 14);
      startY += 20;
    };

    // Renderizado de Información General
    doc.addPage();
    startY = 20;
    drawStyledSectionHeader("Resumen General");

    drawInfoCard("Total de acciones:", `${trazabilidadData.length}`);
    Object.entries(groupedData).forEach(([usuario, acciones]) => {
      drawInfoCard(`Usuario: ${usuario}`, `Acciones: ${acciones.length}`);
    });

    drawHighlightedDate();

    const formattedDate = new Date().toISOString().split("T")[0];
    doc.save(`Trazabilidad_Reporte_${formattedDate}.pdf`);
    toast.success("PDF generado exitosamente.");

  } catch (error) {
    console.error("Error al generar el PDF:", error);
    toast.error("Hubo un error al generar el PDF.");
  }
};

export default generatePDFTrazabilidad;