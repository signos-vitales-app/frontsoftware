import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchPatientInfo, fetchPatientHistoryRecords } from '../services/patientService';
import { FiHome } from 'react-icons/fi'; // Icono para el botón de volver

const PatientPage = () => {
    const { idPaciente } = useParams(); // Obtener el ID del paciente desde la URL
    const [patientInfo, setPatientInfo] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Hook para la navegación

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const patientData = await fetchPatientInfo(idPaciente); // Obtener los detalles del paciente
                setPatientInfo(patientData);
                
                const history = await fetchPatientHistoryRecords(idPaciente); // Obtener el historial de signos vitales
                setPatientHistory(history);
                setLoading(false);
            } catch (err) {
                setError('Error al cargar los datos del paciente');
                setLoading(false);
            }
        };

        fetchPatientData();
    }, [idPaciente]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    const handleGoBack = () => {
        navigate(-1); // Redirige a la página anterior
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Formato de fecha (dd/mm/aaaa)
    };

    // Verifica el grupo de edad y devuelve si es adulto o pediátrico
    const isPediatric = patientInfo && patientInfo.age_group !== 'Adulto';

    // Función para comparar los valores de los registros consecutivos
    const getChangedClass = (field, currentRecord, prevRecord) => {
        return prevRecord && currentRecord[field] !== prevRecord[field] ? 'bg-green-300' : ''; // Cambiar color si hay diferencia
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6 overflow-auto">
            <h1 className="text-2xl font-bold mb-6">Historial de Signos Vitales</h1>
            
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-7xl mb-6 overflow-x-auto">
                <table className="w-full border-collapse table-auto text-sm">
                    <thead>
                        <tr className="bg-blue-100 text-left">
                            <th className="p-3 border-b-2">ID Registro</th>
                            <th className="p-3 border-b-2">Fecha</th>
                            <th className="p-3 border-b-2">Hora</th>
                            <th className="p-3 border-b-2">Pulso</th>
                            <th className="p-3 border-b-2">Temperatura</th>
                            <th className="p-3 border-b-2">Frecuencia Respiratoria</th>
                            <th className="p-3 border-b-2">Presión Sistólica</th>
                            <th className="p-3 border-b-2">Presión Diastólica</th>
                            <th className="p-3 border-b-2">Presión Media</th>
                            <th className="p-3 border-b-2">Saturación de Oxígeno</th>
                            {isPediatric ? (
                                <th className="p-3 border-b-2">Peso Pediátrico</th>
                            ) : (
                                <th className="p-3 border-b-2">Peso Adulto</th>
                            )}
                            <th className="p-3 border-b-2">Talla</th>
                            <th className="p-3 border-b-2">Observaciones</th>
                            <th className="p-3 border-b-2">Responsable</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patientHistory.map((currentRecord, index) => {
                            // Obtener el registro anterior
                            const prevRecord = index > 0 ? patientHistory[index - 1] : null;

                            return (
                                <tr key={currentRecord.id_registro} className="text-center">
                                    <td className="p-3 border">{currentRecord.id_registro}</td>
                                    <td className="p-3 border">{formatDate(currentRecord.record_date)}</td>
                                    <td className="p-3 border">{currentRecord.record_time}</td>
                                    <td className={`p-3 border ${getChangedClass('pulso', currentRecord, prevRecord)}`}>{currentRecord.pulso}</td>
                                    <td className={`p-3 border ${getChangedClass('temperatura', currentRecord, prevRecord)}`}>{currentRecord.temperatura}</td>
                                    <td className={`p-3 border ${getChangedClass('frecuencia_respiratoria', currentRecord, prevRecord)}`}>{currentRecord.frecuencia_respiratoria}</td>
                                    <td className={`p-3 border ${getChangedClass('presion_sistolica', currentRecord, prevRecord)}`}>{currentRecord.presion_sistolica}</td>
                                    <td className={`p-3 border ${getChangedClass('presion_diastolica', currentRecord, prevRecord)}`}>{currentRecord.presion_diastolica}</td>
                                    <td className={`p-3 border ${getChangedClass('presion_media', currentRecord, prevRecord)}`}>{currentRecord.presion_media}</td>
                                    <td className={`p-3 border ${getChangedClass('saturacion_oxigeno', currentRecord, prevRecord)}`}>{currentRecord.saturacion_oxigeno}</td>
                                    {isPediatric ? (
                                        <td className={`p-3 border ${getChangedClass('peso_pediatrico', currentRecord, prevRecord)}`}>{currentRecord.peso_pediatrico}</td>
                                    ) : (
                                        <td className={`p-3 border ${getChangedClass('peso_adulto', currentRecord, prevRecord)}`}>{currentRecord.peso_adulto}</td>
                                    )}
                                    <td className={`p-3 border ${getChangedClass('talla', currentRecord, prevRecord)}`}>{currentRecord.talla}</td>
                                    <td className={`p-3 border ${getChangedClass('observaciones', currentRecord, prevRecord)}`}>{currentRecord.observaciones}</td>
                                    <td className={`p-3 border ${getChangedClass('responsable_signos', currentRecord, prevRecord)}`}>{currentRecord.responsable_signos}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Botón de regresar */}
            <button
                onClick={handleGoBack}
                className="flex items-center px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 transition"
            >
                <FiHome className="mr-2" /> Regresar
            </button>
        </div>
    );
};

export default PatientPage;
