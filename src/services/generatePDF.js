import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from "react-toastify";
import axios from "axios";

const generatePDF = async (patientInfo, edad, ageUnit, ageGroup, filteredRecords, rangos, chartRef, exportTxt = false) => {

    try {

        // Llamada al backend para registrar la descarga en trazabilidad
        await axios.get(
            `https://backsoftware.onrender.com/api/patients/${patientInfo.id}/download`, // URL del backend
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Token del usuario
                },
            }
        );

        console.log("Descarga registrada exitosamente en trazabilidad.");

        // Crear un nuevo documento PDF
        const doc = new jsPDF({ orientation: "landscape" });

        // Configurar el contenido de la primera página
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(
            'Historial Médico del Paciente',
            doc.internal.pageSize.getWidth() / 2,
            15,
            { align: 'center' }
        );

        // Agregar una línea negra debajo del título
        const pageWidth = doc.internal.pageSize.getWidth(); // Ancho de la página
        doc.setDrawColor(0, 0, 0); // Color negro para la línea
        doc.setLineWidth(0.7); // Grosor de la línea
        doc.line(10, 20, pageWidth - 10, 20); // Coordenadas (x1, y1, x2, y2)

        // Función para formatear la fecha (solo día, mes, año)
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

        const capitalizeWords = (text) => {
            const excludedWords = ["de"];
            return text
                .toLowerCase()
                .split(" ")
                .map((word, index) => {
                    // Capitalizar si no está en la lista de excluidas o es la primera palabra
                    if (!excludedWords.includes(word) || index === 0) {
                        return word.charAt(0).toUpperCase() + word.slice(1);
                    }
                    return word;
                })
                .join(" ");
        };

        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text(
            'Historial Médico del Paciente',
            doc.internal.pageSize.getWidth() / 2,
            15, // Cambia la posición vertical a 15 para un espaciado uniforme
            { align: 'center' }
        );

        // Información del paciente
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text("Nombre:", 20, 30);
        doc.text("Tipo de Identificación:", 20, 35);
        doc.text("Número de Identificación:", 20, 40);
        doc.text("Fecha de Nacimiento:", 20, 45);
        doc.text("Edad:", 20, 50);
        doc.text("Tipo de Paciente:", 20, 55);
        doc.text("Ubicación (habitación):", 20, 60);
        doc.text("Estado:", 20, 65);

        doc.setFont("helvetica", "normal");
        doc.text(`${patientInfo.primer_nombre} ${patientInfo.segundo_nombre} ${patientInfo.primer_apellido} ${patientInfo.segundo_apellido}`, 39, 30);
        doc.text(capitalizeWords(patientInfo.tipo_identificacion), 66, 35);
        doc.text(patientInfo.numero_identificacion, 73, 40);
        doc.text(formatDate(patientInfo.fecha_nacimiento), 64, 45);
        doc.text(`${edad} ${ageUnit}`, 33, 50);
        doc.text(ageGroup, 56, 55);
        doc.text(patientInfo.ubicacion, 68, 60);

        if (patientInfo.status === 'activo') {
            doc.setTextColor(0, 128, 0); // Verde
            doc.text("Activo", 37, 65);
        } else {
            doc.setTextColor(255, 0, 0); // Rojo
            doc.text("Inactivo", 37, 65);
        }
        doc.setTextColor(0, 0, 0); // Restablecer color

        // Datos de la tabla
        const tableColumns = [
            "Fecha", "Hora", "Pulso (LPM)", "T °C", "FR (RPM)",
            "TAS (mmHg)", "TAD (mmHg)", "TAM (mmHg)", "SatO2 %", "Peso (kg)", "Talla (cm)", "Observaciones", "Responsable"
        ];

        // Definir los rangos específicos
        const vitalSignRanges = {
            pulso: {
                'Recién nacido': { min: 90, max: 180 },
                'Lactante temprano': { min: 80, max: 160 },
                'Lactante mayor': { min: 80, max: 140 },
                'Niño pequeño': { min: 75, max: 110 },
                'Preescolar temprano': { min: 70, max: 110 },
                'Preescolar tardío': { min: 60, max: 90 },
                'Adulto': { min: 60, max: 90 },
            },
            temperatura: {
                'Recién nacido': { min: 36.0, max: 37.5 },
                'Lactante temprano': { min: 36.0, max: 37.5 },
                'Lactante mayor': { min: 36.0, max: 37.5 },
                'Niño pequeño': { min: 36.0, max: 37.5 },
                'Preescolar temprano': { min: 36.0, max: 37.5 },
                'Preescolar tardío': { min: 36.0, max: 37.5 },
                'Adulto': { min: 36.5, max: 37.5 },
            },
            frecuencia_respiratoria: {
                'Recién nacido': { min: 30, max: 60 },
                'Lactante temprano': { min: 30, max: 60 },
                'Lactante mayor': { min: 24, max: 40 },
                'Niño pequeño': { min: 20, max: 30 },
                'Preescolar temprano': { min: 20, max: 30 },
                'Preescolar tardío': { min: 16, max: 24 },
                'Adulto': { min: 12, max: 16 },
            },
            presion_sistolica: {
                'Recién nacido': { min: 60, max: 90 },
                'Lactante temprano': { min: 80, max: 100 },
                'Lactante mayor': { min: 90, max: 110 },
                'Niño pequeño': { min: 95, max: 110 },
                'Preescolar temprano': { min: 100, max: 120 },
                'Preescolar tardío': { min: 105, max: 120 },
                'Adulto': { min: 100, max: 140 },
            },
            presion_diastolica: {
                'Recién nacido': { min: 30, max: 60 },
                'Lactante temprano': { min: 50, max: 70 },
                'Lactante mayor': { min: 55, max: 75 },
                'Niño pequeño': { min: 60, max: 75 },
                'Preescolar temprano': { min: 65, max: 80 },
                'Preescolar tardío': { min: 70, max: 85 },
                'Adulto': { min: 60, max: 90 },
            },
            saturacion_oxigeno: {
                'Recién nacido': { min: 95, max: 100 },
                'Lactante temprano': { min: 95, max: 100 },
                'Lactante mayor': { min: 95, max: 100 },
                'Niño pequeño': { min: 95, max: 100 },
                'Preescolar temprano': { min: 95, max: 100 },
                'Preescolar tardío': { min: 95, max: 100 },
                'Adulto': { min: 95, max: 100 },
            },
            presion_media: {
                'Recién nacido': { min: 50, max: 70 },
                'Lactante temprano': { min: 60, max: 85 },
                'Lactante mayor': { min: 70, max: 95 },
                'Niño pequeño': { min: 75, max: 100 },
                'Preescolar temprano': { min: 80, max: 105 },
                'Preescolar tardío': { min: 85, max: 110 },
                'Adulto': { min: 70, max: 105 },
            },
        };


        // Calcular el color según los rangos
        const calculateColor = (value, range) => {
            if (value < range.min) return [120, 190, 230]; // Azul
            if (value > range.max) return [255, 200, 200]; // Rojo
            return null; // Conservar el color actual
        };

        // Crear los datos de la tabla
        const tableData = filteredRecords.map((record) => {
            const group = record.ageGroup || ageGroup; // Si no se tiene en el registro, usar el `ageGroup` pasado
            return [
                formatDate(record.record_date),
                record.record_time,
                {
                    content: record.pulso,
                    styles: {
                        fillColor: calculateColor(record.pulso, vitalSignRanges.pulso[group]),
                    },
                },
                {
                    content: record.temperatura,
                    styles: {
                        fillColor: calculateColor(record.temperatura, vitalSignRanges.temperatura[group]),
                    },
                },
                {
                    content: record.frecuencia_respiratoria,
                    styles: {
                        fillColor: calculateColor(record.frecuencia_respiratoria, vitalSignRanges.frecuencia_respiratoria[group]),
                    },
                },
                {
                    content: record.presion_sistolica,
                    styles: {
                        fillColor: calculateColor(record.presion_sistolica, vitalSignRanges.presion_sistolica[group]),
                    },
                },
                {
                    content: record.presion_diastolica,
                    styles: {
                        fillColor: calculateColor(record.presion_diastolica, vitalSignRanges.presion_diastolica[group]),
                    },
                },
                {
                    content: record.presion_media,
                    styles: {
                        fillColor: calculateColor(record.presion_media, vitalSignRanges.presion_media[group]),
                    },
                },
                {
                    content: record.saturacion_oxigeno,
                    styles: {
                        fillColor: calculateColor(record.saturacion_oxigeno, vitalSignRanges.saturacion_oxigeno[group]),
                    },
                },
                { content: record.peso_pediatrico || record.peso_adulto, styles: {} },
                { content: record.talla || "-", styles: {} },
                { content: record.observaciones || "-", styles: {} },
                { content: record.responsable_signos || "No disponible", styles: {} },

            ];
        });

        // Tabla en la primera página
        autoTable(doc, {
            head: [tableColumns],
            body: tableData,
            startY: 75,
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
                fontSize: 8,
                valign: 'middle',
            },
            bodyStyles: {
                halign: 'center',
                textColor: [0, 0, 0],
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245],
            },
            columnStyles: {
                0: { cellWidth: 20, halign: 'center', valign: 'middle' }, // Columna 1 (Ajusta a 30 mm)
                1: { cellWidth: 20, halign: 'center', valign: 'middle' }, // Columna 2
                2: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 3
                3: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 4
                4: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 5
                5: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 6
                6: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 7
                7: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 8
                8: { cellWidth: 20, halign: 'center', valign: 'middle' }, // Columna 9
                9: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 10
                10: { cellWidth: 15, halign: 'center', valign: 'middle' }, // Columna 11
                11: { cellWidth: 60, halign: 'center', valign: 'middle' }, // Columna 12
                12: { cellWidth: 30, halign: 'center', valign: 'middle' }, // Columna 13
            },
        });

        // Agregar una nueva página en orientación vertical
        doc.addPage("p"); // "p" para orientación vertical

        // Espaciado entre la tabla y los gráficos
        doc.setFontSize(12);
        doc.text('Grafico de signos vitales:', 20, 20);

        // Iterar sobre todos los gráficos y agregarlos al PDF
        const canvasElements = chartRef.current.querySelectorAll("canvas");
        canvasElements.forEach((canvas, index) => {
            // Si no es la primera gráfica, agrega una nueva página
            if (index > 0) {
                doc.addPage(); // Agrega una nueva página para cada gráfica adicional
            }

            // Capturar el gráfico como imagen
            const imgData = canvas.toDataURL("image/png");

            // Ajustar las dimensiones de la gráfica
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const imgWidth = 250; // Ancho de la gráfica (ajustar según necesidad)
            const imgHeight = 150; // Altura de la gráfica (ajustar según necesidad)

            // Calcular las posiciones para centrar la gráfica
            const xPosition = (pageWidth - imgWidth) / 2;
            const yPosition = (pageHeight - imgHeight) / 2;

            // Añadir la gráfica al PDF
            doc.addImage(imgData, "PNG", xPosition, yPosition, imgWidth, imgHeight);
        });

        // Formatear el nombre del archivo con el nombre completo del paciente y su número de identificación
        const fileName = `Historial_Medico_${patientInfo.primer_nombre}_${patientInfo.primer_apellido}_${patientInfo.numero_identificacion}.pdf`;

        // Guardar el PDF generado con el nombre formateado
        doc.save(fileName);

        if (exportTxt) {
            // Generar archivo TXT
            let txtContent = `Historial Médico del Paciente\n\n`;
            txtContent += `Nombre: ${patientInfo.primer_nombre} ${patientInfo.segundo_nombre} ${patientInfo.primer_apellido} ${patientInfo.segundo_apellido}\n`;
            txtContent += `Tipo de Identificación: ${capitalizeWords(patientInfo.tipo_identificacion)}\n`;
            txtContent += `Número de Identificación: ${patientInfo.numero_identificacion}\n`;
            txtContent += `Fecha de Nacimiento: ${formatDate(patientInfo.fecha_nacimiento)}\n`;
            txtContent += `Edad: ${edad} ${ageUnit}\n`;
            txtContent += `Tipo de Paciente: ${ageGroup}\n`;
            txtContent += `Ubicación: ${patientInfo.ubicacion}\n`;
            txtContent += `Estado: ${patientInfo.status === 'activo' ? 'Activo' : 'Inactivo'}\n\n`;

            // Encabezados de la tabla
            txtContent += `Registros:\n`;
            txtContent += `${'Fecha'.padEnd(12)}${'Hora'.padEnd(8)}${'Pulso'.padEnd(8)}${'T °C'.padEnd(8)}${'FR'.padEnd(8)}${'TAS'.padEnd(8)}${'TAD'.padEnd(8)}${'TAM'.padEnd(8)}${'SatO2 %'.padEnd(10)}${'Peso'.padEnd(10)}${'Talla'.padEnd(8)}${'Observaciones'.padEnd(20)}${'Responsable'.padEnd(20)}\n`;

            // Registros de la tabla
            filteredRecords.forEach(record => {
                txtContent += `${formatDate(record.record_date).padEnd(12)}` +
                    `${record.record_time.padEnd(8)}` +
                    `${record.pulso.toString().padEnd(8)}` +
                    `${record.temperatura.toString().padEnd(8)}` +
                    `${record.frecuencia_respiratoria.toString().padEnd(8)}` +
                    `${record.presion_sistolica.toString().padEnd(8)}` +
                    `${record.presion_diastolica.toString().padEnd(8)}` +
                    `${record.presion_media.toString().padEnd(8)}` +
                    `${record.saturacion_oxigeno.toString().padEnd(10)}` +
                    `${(record.peso_pediatrico || record.peso_adulto || "-").toString().padEnd(10)}` +
                    `${(record.talla || "-").toString().padEnd(8)}` +
                    `${(record.observaciones || "-").padEnd(20)}` +
                    `${(record.responsable_signos || "No disponible").padEnd(20)}\n`;
            });

            const sanitize = (str) => {
                return str
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z0-9]/g, "_");
            };

            const txtFileName = `Historial_Medico_${sanitize(patientInfo.primer_nombre)}_${sanitize(patientInfo.primer_apellido)}_${patientInfo.numero_identificacion}.txt`;

            // Descargar archivo TXT
            const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
            const txtLink = document.createElement('a');
            txtLink.href = URL.createObjectURL(blob);
            txtLink.download = txtFileName;
            txtLink.click();
        }

    } catch (error) {
        console.error("Error generando el PDF:", error);
        toast.error("Hubo un error al generar el PDF.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    }
};

export default generatePDF;