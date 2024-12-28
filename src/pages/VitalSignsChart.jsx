import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const VitalSignsChart = ({ records, selectedVariables }) => {
    const getLabels = () => {
        return records.map((record, index) => {
            if (record.record_date && record.record_time) {
                // Extraer solo la fecha (YYYY-MM-DD) de record_date
                const datePart = record.record_date.split('T')[0];
                const dateTimeString = `${datePart}T${record.record_time}`;

                const dateTime = new Date(dateTimeString);

                if (!isNaN(dateTime)) {
                    return format(dateTime, 'dd/MM/yyyy HH:mm:ss');
                } else {
                    return 'Fecha inválida';
                }
            } else {
                return 'Fecha/Hora no disponible';
            }
        });
    };

    const createDataset = (label, dataKey, color) => ({
        label,
        data: records.map(record => record[dataKey]),
        borderColor: color,
        backgroundColor: color,
        tension: 0.2,
        fill: false,
    });

    const colors = {
        pulso: 'rgb(255, 15, 15)',
        temperatura: 'rgb(250, 147, 23)',
        frecuencia_respiratoria: 'rgb(25, 204, 31)',
        presion_sistolica: 'rgb(153, 102, 255)',
        presion_diastolica: 'rgb(204, 25, 163)',
        presion_media: 'rgb(249, 246, 91)',
        saturacion_oxigeno: 'rgb(53, 154, 255)',
    };

    // Calcular presion_media si no existe directamente
    const calculatePresionMedia = (record) => {
        if (record.presion_sistolica && record.presion_diastolica) {
            return (
                (record.presion_sistolica + 2 * record.presion_diastolica) / 3
            ).toFixed(2); // Redondear a 2 decimales
        }
        return null;
    };

    // Agregar presion_media a los registros
    const processedRecords = records.map((record) => ({
        ...record,
        presion_media: calculatePresionMedia(record),
    }));

    const data = {
        labels: getLabels(),
        datasets: selectedVariables.map(variable =>
            createDataset(variable, variable, colors[variable])
        ),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Signos Vitales del Paciente' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'Valor' }, beginAtZero: true },
        },
    };

    // "pulso" 
    const pulsoData = {
        labels: getLabels(),
        datasets: [
            createDataset('Pulso', 'pulso', colors.pulso),
        ],
    };

    const pulsoOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Pulso del Paciente' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'Latidos por minuto' }, beginAtZero: true },
        },
    };

    // "FR" 
    const frecuencia_respiratoriaData = {
        labels: getLabels(),
        datasets: [
            createDataset('Frecuencia Respiratoria', 'frecuencia_respiratoria', colors.frecuencia_respiratoria),
        ],
    };

    const frecuencia_respiratoriaOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Frecuencia Respiratoria' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'Respiraciones por minuto' }, beginAtZero: true },
        },
    };

    // "systolic Pressure" 
    const presion_sistolicaData = {
        labels: getLabels(),
        datasets: [
            createDataset('Presion sistolica', 'presion_sistolica', colors.presion_sistolica),
        ],
    };

    const presion_sistolicaOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Presion sistolica del Paciente' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'mmHg' }, beginAtZero: true },
        },
    };
    // "Diastolic Pressure" 
    const presion_diastolicaData = {
        labels: getLabels(),
        datasets: [
            createDataset('Presion diastolica', 'presion_diastolica', colors.presion_diastolica),
        ],
    };

    const presion_diastolicaOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Presion diastolica del Paciente' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'mmHg' }, beginAtZero: true },
        },
    };

    // "Presión Media"
    const presion_mediaData = {
        labels: getLabels(),
        datasets: [
            createDataset('Presión Media', 'presion_media', colors.presion_media),
        ],
    };

    const presion_mediaOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Presión Media del Paciente' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: 'mmHg' }, beginAtZero: true },
        },
    };


    // "temperatura" 
    const temperaturaData = {
        labels: getLabels(),
        datasets: [
            createDataset('Temperatura', 'temperatura', colors.temperatura),
        ],
    };

    const temperaturaOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Temperatura del Paciente' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: '°C' }, beginAtZero: true },
        },
    };
    // "saturacion de oxigeno" 
    const saturacion_oxigenoData = {
        labels: getLabels(),
        datasets: [
            createDataset('Saturacion oxigeno', 'saturacion_oxigeno', colors.saturacion_oxigeno),
        ],
    };

    const saturacion_oxigenoOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Saturacion de oxigeno del Paciente' },
        },
        scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { title: { display: true, text: '%' }, beginAtZero: true },
        },
    };

    return (
        <div>
            {/* Gráfico principal de todos los signos vitales */}
            {/*<Line data={data} options={options} />*/}

            {/* Gráfico de "Pulso"  */}
            {selectedVariables.includes('pulso') && (
                <div className="mt-8">
                    <Line data={pulsoData} options={pulsoOptions} />
                </div>
            )}
            {/* Gráfico de "Temperatura"  */}
            {selectedVariables.includes('temperatura') && (
                <div className="mt-8">
                    <Line data={temperaturaData} options={temperaturaOptions} />
                </div>
            )}
            {/* Gráfico de "FR"  */}
            {selectedVariables.includes('frecuencia_respiratoria') && (
                <div className="mt-8">
                    <Line data={frecuencia_respiratoriaData} options={frecuencia_respiratoriaOptions} />
                </div>
            )}
            {/* Gráfico de "PS"  */}
            {selectedVariables.includes('presion_sistolica') && (
                <div className="mt-8">
                    <Line data={presion_sistolicaData} options={presion_sistolicaOptions} />
                </div>
            )}
            {/* Gráfico de "PD"  */}
            {selectedVariables.includes('presion_diastolica') && (
                <div className="mt-8">
                    <Line data={presion_diastolicaData} options={presion_diastolicaOptions} />
                </div>
            )}
            {/* Gráfico de "PD"  */}
            {selectedVariables.includes('presion_media') && (
                <div className="mt-8">
                    <Line data={presion_mediaData} options={presion_mediaOptions} />
                </div>
            )}
            {/* Gráfico de "FR"  */}
            {selectedVariables.includes('saturacion_oxigeno') && (
                <div className="mt-8">
                    <Line data={saturacion_oxigenoData} options={saturacion_oxigenoOptions} />
                </div>
            )}

        </div>
    );
};

export default VitalSignsChart;
