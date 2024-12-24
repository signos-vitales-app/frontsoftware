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
  doc.setFontSize(16);
  doc.text('Trazabilidad del paciente', 14, 20);

  // Helper para dar formato a las fechas
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Tabla: Historial del Paciente
  if (filteredHistory.length > 0) {
    doc.setFontSize(12);
    doc.text('Historial cambios del Paciente', 14, 30);

    const historyTableData = filteredHistory.map((record, index) => {
      const nextRecord = filteredHistory[index + 1] || {};
      return [
        {
          content: formatDate(record.created_at.split('T')[0]), // Fecha
          styles: { fillColor: isModified(formatDate(record.created_at.split('T')[0]), formatDate(nextRecord.created_at?.split('T')[0])) ? [144, 238, 144] : null }
        },
        {
          content: record.created_at.split('T')[1].slice(0, 5), // Hora
          styles: { fillColor: isModified(record.created_at.split('T')[1], nextRecord.created_at?.split('T')[1]) ? [144, 238, 144] : null }
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
        { content: record.responsable_registro? record.responsable_registro:"-", styles: { fillColor: isModified(record.responsable_registro, nextRecord.responsable_registro) ? [144, 238, 144] : null } },
      ];
    });

    autoTable(doc, {
      startY: 35,
      head: [['Fecha', 'Hora', 'Primer Nombre', 'Segundo Nombre', 'Primer Apellido', 'Segundo Apellido', 'Tipo Identificación', 'Número Identificación', 'Ubicación', 'Fecha Nacimiento', 'Estado', 'Tipo de Paciente', 'Responsable']],
      body: historyTableData,
    });
  }

  // Si no se seleccionan IDs, muestra la tabla con un mensaje y solo encabezados
  if (selectedIds.size === 0) {
    const startY = doc.lastAutoTable.finalY + 10;
    doc.text('Historial cambios de Signos Vitales', 14, startY);
    doc.text('No se seleccionaron ids de registros para exportar', 14, startY+5);

    autoTable(doc, {
      startY: startY + 10,
      head: [['Fecha', 'Hora', 'Pulso', 'T °C', 'FR', 'TAS', 'TAD', 'TAM', 'SatO2 %', isPediatric ? 'Peso Pediátrico' : 'Peso Adulto', 'Talla', 'Observaciones', 'Responsable']],
      body: [
        ['-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-'],
      ],
    });
  } else {
    // Filtrar los registros de signos vitales seleccionados
    const selectedRecords = filteredPatientHistory.filter(record => selectedIds.has(record.id_registro));

    // Tabla: Historial de Signos Vitales (solo los seleccionados)
    if (selectedRecords.length > 0) {
      const startY = doc.lastAutoTable.finalY + 10; // Ajustar el inicio de la siguiente tabla
      doc.text('Historial cambios de Signos Vitales', 14, startY);

      const patientHistoryTableData = selectedRecords.map((currentRecord, index) => {
        const prevRecord = index > 0 ? selectedRecords[index - 1] : null;
        return [
          currentRecord.id_registro,
          { content: formatDate(currentRecord.record_date.split('T')[0]), styles: { fillColor: getChangedClass('record_date', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.record_time, styles: { fillColor: getChangedClass('record_time', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.pulso, styles: { fillColor: getChangedClass('pulso', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.temperatura, styles: { fillColor: getChangedClass('temperatura', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.frecuencia_respiratoria, styles: { fillColor: getChangedClass('frecuencia_respiratoria', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.presion_sistolica, styles: { fillColor: getChangedClass('presion_sistolica', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.presion_diastolica, styles: { fillColor: getChangedClass('presion_diastolica', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.presion_media, styles: { fillColor: getChangedClass('presion_media', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.saturacion_oxigeno, styles: { fillColor: getChangedClass('saturacion_oxigeno', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: isPediatric ? currentRecord.peso_pediatrico : currentRecord.peso_adulto, styles: { fillColor: getChangedClass(isPediatric ? 'peso_pediatrico' : 'peso_adulto', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.talla, styles: { fillColor: getChangedClass('talla', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.observaciones ? currentRecord.observaciones : '-', styles: { fillColor: getChangedClass('observaciones', currentRecord, prevRecord) ? [144, 238, 144] : null } },
          { content: currentRecord.responsable_signos, styles: { fillColor: getChangedClass('responsable_signos', currentRecord, prevRecord) ? [144, 238, 144] : null } },
        ];
      });

      autoTable(doc, {
        startY: startY + 5,
        head: [['ID Registro', 'Fecha', 'Hora', 'Pulso', 'T °C', 'FR', 'TAS', 'TAD', 'TAM', 'SatO2 %', isPediatric ? 'Peso Pediátrico' : 'Peso Adulto', 'Talla', 'Observaciones', 'Responsable']],
        body: patientHistoryTableData,
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