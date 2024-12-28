import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePatientPDF = (patientInfo, isPediatric, filteredHistory, filteredPatientHistory, selectedIds) => {
  const doc = new jsPDF("l");

  // Comprobar si filteredPatientHistory está definido y es un array
  if (!Array.isArray(filteredPatientHistory)) {
    console.error("filteredPatientHistory no es un arreglo válido.");
    return;
  }

  console.log(patientInfo);  // Asegúrate de que `patientInfo` tenga los datos correctos.

  // Título del documento
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Trazabilidad del paciente', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  doc.setDrawColor(0, 0, 0);
  doc.line(10, 22, doc.internal.pageSize.getWidth() - 10, 22); // Línea horizontal debajo del título

  // Helper para dar formato a las fechas
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Tabla: Historial del Paciente
  if (filteredHistory.length > 0) {
    doc.setFontSize(14);
    doc.text('Historial de Cambios del Paciente', doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });

    const historyTableData = filteredHistory.map((record, index) => {
      const nextRecord = filteredHistory[index + 1] || {};
      return [
        {
          content: formatDate(record.created_at.split('T')[0]), // Fecha
          styles: { fillColor: isModified(formatDate(record.created_at.split('T')[0]), formatDate(nextRecord.created_at?.split('T')[0])) ? [144, 238, 144] : null }
        },
        {
          content: record.created_at.split('T')[1].slice(0, 5), // Hora
          styles: { fillColor: isModified(record.created_at.split('T')[1], nextRecord.created_at?.split('T')[1].slice(0, 5)) ? [144, 238, 144] : null }
        },
        { content: record.primer_nombre, styles: { fillColor: isModified(record.primer_nombre, nextRecord.primer_nombre) ? [144, 238, 144] : null } },
        { content: record.segundo_nombre, styles: { fillColor: isModified(record.segundo_nombre, nextRecord.segundo_nombre) ? [144, 238, 144] : null } },
        { content: record.primer_apellido, styles: { fillColor: isModified(record.primer_apellido, nextRecord.primer_apellido) ? [144, 238, 144] : null } },
        { content: record.segundo_apellido, styles: { fillColor: isModified(record.segundo_apellido, nextRecord.segundo_apellido) ? [144, 238, 144] : null } },
        { content: record.tipo_identificacion, styles: { fillColor: isModified(record.tipo_identificacion, nextRecord.tipo_identificacion) ? [144, 238, 144] : null } },
        { content: record.numero_identificacion, styles: { fillColor: isModified(record.numero_identificacion, nextRecord.numero_identificacion) ? [144, 238, 144] : null } },
        { content: record.ubicacion, styles: { fillColor: isModified(record.ubicacion, nextRecord.ubicacion) ? [144, 238, 144] : null } },
        { content: formatDate(record.fecha_nacimiento), styles: { fillColor: isModified(record.fecha_nacimiento, nextRecord.fecha_nacimiento) ? [144, 238, 144] : null } },
        { content: record.status, styles: { textColor: record.status === 'activo' ? [0, 128, 0] : [255, 0, 0] } },
        { content: record.age_group, styles: { fillColor: isModified(record.age_group, nextRecord.age_group) ? [144, 238, 144] : null } },
        { content: record.responsable_registro ? record.responsable_registro : "-", styles: { fillColor: isModified(record.responsable_registro, nextRecord.responsable_registro) ? [144, 238, 144] : null } },
      ];
    });

    autoTable(doc, {
      startY: 45,
      head: [['Fecha', 'Hora', 'Primer Nombre', 'Segundo Nombre', 'Primer Apellido', 'Segundo Apellido', 'Tipo Identificación', 'Número Identificación', 'Ubicación', 'Fecha Nacimiento', 'Estado', 'Tipo de Paciente', 'Responsable']],
      body: historyTableData,
      theme: 'plain', // Estilo plano para hacerlo más sobrio
      styles: {
        fontSize: 9, // Tamaño reducido para una tabla compacta
        cellPadding: 2, // Menos espacio entre las celdas
        halign: 'center', // Centrar texto en todas las celdas
        lineWidth: 0.1, // Bordes delgados
        lineColor: [0, 0, 0], // Bordes negros
      },
      headStyles: {
        fillColor: [154, 208, 245], // Azul clarito para el encabezado
        textColor: [0, 0, 0], // Texto negro en el encabezado
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10, // Tamaño de fuente reducido
        valign: 'middle', // Alinear verticalmente al centro
      },
      bodyStyles: {
        halign: 'center',
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245], // Fondo alternado para filas
      },
      columnStyles: {
        0: { halign: 'center', valign: 'middle' }, // Ajustar alineación vertical y horizontal para la primera columna
        1: { halign: 'center', valign: 'middle' },
        2: { halign: 'center', valign: 'middle' },
        3: { halign: 'center', valign: 'middle' },
        4: { halign: 'center', valign: 'middle' },
        5: { halign: 'center', valign: 'middle' },
        6: { halign: 'center', valign: 'middle' },
        7: { halign: 'center', valign: 'middle' },
        8: { halign: 'center', valign: 'middle' },
        9: { halign: 'center', valign: 'middle' },
        10: { halign: 'center', valign: 'middle' },
        11: { halign: 'center', valign: 'middle' },
        12: { halign: 'center', valign: 'middle' },
      },
    });
  }

  // Si no se seleccionan IDs, muestra la tabla con un mensaje y solo encabezados
  if (selectedIds.size === 0) {
    const startY = doc.lastAutoTable.finalY + 20;
    doc.setFontSize(14); // Cambia este valor según el tamaño deseado
    doc.text('Historial de Cambios de Signos Vitales', doc.internal.pageSize.getWidth() / 2, startY, { align: 'center' });
    doc.setTextColor(255, 0, 0); // Establecer el color del texto a rojo (RGB: 255, 0, 0)
    doc.text('No se seleccionaron IDs de registros para exportar', doc.internal.pageSize.getWidth() / 2, startY + 5, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Restaurar el color del texto a negro para el resto del documento

    autoTable(doc, {
      startY: startY + 10,
      head: [['Fecha', 'Hora', 'Pulso', 'T °C', 'FR', 'TAS', 'TAD', 'TAM', 'SatO2 %', isPediatric ? 'Peso Pediátrico' : 'Peso Adulto', 'Talla', 'Observaciones', 'Responsable']],
      body: [
        ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
      ],
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 2,
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      headStyles: {
        fillColor: [154, 208, 245],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 10,
        valign: 'middle',
      },
      bodyStyles: {
        halign: 'center',
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles:
      {
        0: { halign: 'center', valign: 'middle' }, 1: { halign: 'center', valign: 'middle' }, 2: { halign: 'center', valign: 'middle' },
        3: { halign: 'center', valign: 'middle' }, 4: { halign: 'center', valign: 'middle' }, 5: { halign: 'center', valign: 'middle' },
        6: { halign: 'center', valign: 'middle' }, 7: { halign: 'center', valign: 'middle' }, 8: { halign: 'center', valign: 'middle' },
        9: { halign: 'center', valign: 'middle' }, 10: { halign: 'center', valign: 'middle' }, 11: { halign: 'center', valign: 'middle' },
        12: { halign: 'center', valign: 'middle' },
      },
    });
  } else {
    // Filtrar los registros de signos vitales seleccionados
    const selectedRecords = filteredPatientHistory.filter(record => selectedIds.has(record.id_registro));

    // Tabla: Historial de Signos Vitales (solo los seleccionados)
    if (selectedRecords.length > 0) {
      const startY = doc.lastAutoTable.finalY + 10; // Ajustar el inicio de la siguiente tabla
      doc.setFontSize(14); // Cambia este valor según el tamaño deseado
      doc.text('Historial de Cambios de Signos Vitales', doc.internal.pageSize.getWidth() / 2, startY, { align: 'center' });

      const patientHistoryTableData = selectedRecords.map((currentRecord, index) => {
        const prevRecord = index > 0 ? selectedRecords[index - 1] : null;

        return [
          { content: formatDate(currentRecord.record_date.split('T')[0]), styles: { fillColor: getChangedClass('record_date', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.record_time || '-', styles: { fillColor: getChangedClass('record_time', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.pulso?.toString() || '-', styles: { fillColor: getChangedClass('pulso', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.temperatura?.toString() || '-', styles: { fillColor: getChangedClass('temperatura', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.frecuencia_respiratoria?.toString() || '-', styles: { fillColor: getChangedClass('frecuencia_respiratoria', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.presion_sistolica?.toString() || '-', styles: { fillColor: getChangedClass('presion_sistolica', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.presion_diastolica?.toString() || '-', styles: { fillColor: getChangedClass('presion_diastolica', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.presion_media?.toString() || '-', styles: { fillColor: getChangedClass('presion_media', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.saturacion_oxigeno?.toString() || '-', styles: { fillColor: getChangedClass('saturacion_oxigeno', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: patientInfo.age_group === "Pediátrico" ? currentRecord.peso_pediatrico?.toString() || '-' : currentRecord.peso_adulto?.toString() || '-', styles: { fillColor: patientInfo.age_group === "Pediátrico" ? getChangedClass('peso_pediatrico', currentRecord, prevRecord) ? [144, 238, 144] : null : getChangedClass('peso_adulto', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.talla?.toString() || '-', styles: { fillColor: getChangedClass('talla', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.observaciones || '-', styles: { fillColor: getChangedClass('observaciones', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.responsable_signos || '-', styles: { fillColor: getChangedClass('responsable_signos', currentRecord, prevRecord) ? [144, 238, 144] : null } },
        ];
      });

      autoTable(doc, {
        startY: startY + 5,
        head: [['Fecha', 'Hora', 'Pulso', 'T °C', 'FR', 'TAS', 'TAD', 'TAM', 'SatO2 %', patientInfo.age_group === "Pediátrico" ? 'Peso Pediátrico' : 'Peso Adulto', 'Talla', 'Observaciones', 'Responsable']],
        body: patientHistoryTableData,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 2,
          halign: 'center',
          lineWidth: 0.1,
          lineColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [154, 208, 245],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10,
          valign: 'middle',
        },
        bodyStyles: {
          halign: 'center',
          textColor: [0, 0, 0],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles:
        {
          0: { halign: 'center', valign: 'middle' }, 1: { halign: 'center', valign: 'middle' }, 2: { halign: 'center', valign: 'middle' },
          3: { halign: 'center', valign: 'middle' }, 4: { halign: 'center', valign: 'middle' }, 5: { halign: 'center', valign: 'middle' },
          6: { halign: 'center', valign: 'middle' }, 7: { halign: 'center', valign: 'middle' }, 8: { halign: 'center', valign: 'middle' },
          9: { halign: 'center', valign: 'middle' }, 10: { halign: 'center', valign: 'middle' }, 11: { halign: 'center', valign: 'middle' },
          12: { halign: 'center', valign: 'middle' },
        },
      });
    }
  }

  // Obtener el número de identificación desde la propiedad data
  const patientId = patientInfo.data ? patientInfo.data.numero_identificacion : 'Sin_Identificacion';
  doc.save(`Historial_Cambios_Paciente_${patientId}.pdf`);
};

// Helper function para verificar si un campo fue modificado
const isModified = (currentValue, nextValue) => {
  if (nextValue === undefined || nextValue === null) {
    return false;
  }
  const normalizedCurrent = currentValue ? currentValue.toString().trim() : '';
  const normalizedNext = nextValue ? nextValue.toString().trim() : '';
  return normalizedCurrent !== normalizedNext;
};

// Helper function para detectar cambios en signos vitales
const getChangedClass = (field, currentRecord, prevRecord) => {
  if (prevRecord && currentRecord.id_registro === prevRecord.id_registro) {
    return currentRecord[field] !== prevRecord[field];
  }
  return false;
};