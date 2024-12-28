// src/pages/PatientGraphs.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchPatientRecords } from "../services/patientService";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const PatientGraphs = () => {
    const { idPacientee } = useParams();
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const loadPatientRecords = async () => {
            try {
                const response = await fetchPatientRecords(idPaciente);
                setRecords(response.data.records);
            } catch (error) {
                console.error("Error al recuperar registros de pacientes", error);
            }
        };
        loadPatientRecords();
    }, [idPaciente]);

    const generateChartData = (label, dataKey) => {
        return {
            labels: records.map(record => record.record_date),
            datasets: [
                {
                    label: label,
                    data: records.map(record => record[dataKey]),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                },
            ],
        };
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold mb-6">Gráficos del Paciente</h1>

            <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Pulso</h2>
                <Line data={generateChartData("Pulso (lpm)", "pulso")} />
            </div>

            <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Temperatura</h2>
                <Line data={generateChartData("Temperatura (°C)", "temperatura")} />
            </div>

            <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Frecuencia Respiratoria</h2>
                <Line data={generateChartData("Frecuencia Respiratoria (RPM)", "frecuencia_respiratoria")} />
            </div>

            <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">TAS (mmHg)</h2>
                <Line data={generateChartData("TAS (mmHg)", "presion_sistolica")} />
            </div>

            <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">TAD (mmHg)</h2>
                <Line data={generateChartData("TAD (mmHg)", "presion_diastolica")} />
            </div>

            <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Presión Media (mmHg)</h2>
                <Line data={generateChartData("Presión Media (mmHg)", "presion_media")} />
            </div>

            <div className="w-full max-w-4xl mb-8 bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-semibold mb-4">SatO2 (%)</h2>
                <Line data={generateChartData("SatO2 (%)", "saturacion_oxigeno")} />
            </div>
        </div>
    );
};

export default PatientGraphs;