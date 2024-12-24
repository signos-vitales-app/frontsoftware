import React, { useEffect, useState } from "react";
import { fetchPatientHistory, fetchPatientInfo, fetchPatientHistoryRecords } from "../services/patientService";
import { useParams, useNavigate } from "react-router-dom";
import { FiPlusCircle, FiHome, FiX, FiDownload } from "react-icons/fi";
import { FaTimes, FaFilter } from "react-icons/fa"

import "jspdf-autotable";
import { generatePatientPDF } from "../services/generatePatientPDF";
import { toast } from 'react-toastify';  // Importar toast
import 'react-toastify/dist/ReactToastify.css';  // Importar estilos
import Swal from 'sweetalert2';  // Importa SweetAlert2

const PatientHistoryPage = ({ token }) => {
    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]); // Estado para el historial filtrado
    const [patientInfo, setPatientInfo] = useState(null);
    const [patientHistory, setPatientHistory] = useState([]);
    const [filteredPatientHistory, setFilteredPatientHistory] = useState([]); // Nuevo estado para tabla filtrada
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState(new Set()); // Estado para almacenar IDs seleccionados

    const { idPaciente } = useParams();
    const navigate = useNavigate();    // Filtros
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchId, setSearchId] = useState("");


    useEffect(() => {
        const loadPatientData = async () => {
            try {
                const [patientDataResponse, historyResponse, vitalSignsResponse] = await Promise.allSettled([
                    fetchPatientInfo(idPaciente),
                    fetchPatientHistory(idPaciente, token),
                    fetchPatientHistoryRecords(idPaciente),
                ]);
                if (patientDataResponse.status === "fulfilled") {
                    setPatientInfo(patientDataResponse.value || null);
                }
                if (historyResponse.status === "fulfilled") {
                    setHistory(historyResponse.value?.data || []); // Vacío si no hay datos
                    setFilteredHistory(historyResponse.value?.data || []); // Inicializar el historial filtrado

                } else if (historyResponse.reason?.response?.status === 404) {
                    setHistory([]); // Sin historial (404 no es error crítico)
                } else {
                    throw new Error("Error al obtener el historial del paciente");
                }
                if (vitalSignsResponse.status === "fulfilled") {
                    const vitalSignsData = vitalSignsResponse.value || [];
                    setPatientHistory(vitalSignsData);
                    setFilteredPatientHistory(vitalSignsData); // Inicializa el estado de la tabla
                } else if (vitalSignsResponse.reason?.response?.status === 404) {
                    setPatientHistory([]); // Sin signos vitales (404 no es error crítico)
                } else {
                    throw new Error("Error al obtener el historial de signos vitales");
                }
            } catch (err) {
                console.error("Error al cargar los datos del paciente:", err);
                setError("Ocurrió un problema al cargar la información del paciente.");
            } finally {
                setLoading(false);
            }
        };

        loadPatientData();
    }, [idPaciente, token]);


    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Solo la fecha (dd/mm/aaaa)
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(), // Solo la fecha
            time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) // Solo la hora (hh:mm)
        };
    };

    const handleFilterHistory = () => {
        let filtered = history;

        // Convertir fechas de inicio y fin a formato UTC para comparación
        const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
        const end = endDate ? new Date(`${endDate}T23:59:59`) : null;

        // Aplicar el filtro
        filtered = filtered.filter(record => {
            // Convertir la fecha del registro a UTC
            const recordDate = new Date(record.created_at).getTime();

            // Comparar con los rangos de fechas ajustados
            return (
                (!start || recordDate >= start) &&
                (!end || recordDate <= end)
            );
        });

        setFilteredHistory(filtered);
    };

    const handleSearchIdChange = (e) => {
        const value = e.target.value.trim();
        setSearchId(value);

        if (value) {
            // Filtra por ID cuando se ingresa un valor
            setFilteredPatientHistory(patientHistory.filter(record => record.id_registro.toString() === value));
        } else {
            // Muestra todos los registros si se borra el valor
            setFilteredPatientHistory(patientHistory);
        }
    };

    const handleSelectRecord = (id) => {
        setSelectedIds(prevState => {
            const newSelectedIds = new Set(prevState);
            if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id); // Deselecciona
            } else {
                newSelectedIds.add(id); // Selecciona
            }
            return newSelectedIds;
        });
    };

    const handleSelectAllWithId = (id) => {
        setSelectedIds(prevState => {
            const newSelectedIds = new Set(prevState);
            filteredPatientHistory.forEach(record => {
                if (record.id_registro === id) {
                    newSelectedIds.add(id);
                }
            });
            return newSelectedIds;
        });
    };

    const handleGoBack = () => {
        navigate(`/patient/${idPaciente}/records`); // Redirige a la página de búsqueda
    };
    const isModified = (currentValue, nextValue) => {
        if (nextValue === undefined || nextValue === null) {
            return false;
        }
        const normalizedCurrent = currentValue ? currentValue.toString().trim() : "";
        const normalizedNext = nextValue ? nextValue.toString().trim() : "";
        return normalizedCurrent !== normalizedNext;
    };

    const getChangedClass = (field, currentRecord, prevRecord) => {
        if (prevRecord && currentRecord.id_registro === prevRecord.id_registro) {
            return currentRecord[field] !== prevRecord[field] ? "bg-green-300" : "";
        }
        return ""; // No marcar como cambiado si no son del mismo ID
    };

    const exportPDF = async () => {
        try {
            // Verificar si hay registros de signos vitales seleccionados
            const selectedRecords = filteredPatientHistory.filter(record => selectedIds.has(record.id_registro));

            // Si no hay registros seleccionados
            if (selectedRecords.length === 0) {
                const result = await Swal.fire({
                    title: "¿Exportar sin signos vitales?",
                    text: "Este PDF no contiene registros de signos vitales. ¿Estás seguro de que deseas continuar?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Sí, exportar",
                    cancelButtonText: "Cancelar",
                });

                // Si el usuario cancela, no hacer nada
                if (!result.isConfirmed) {
                    return;
                }
            }

            // Generar el PDF si hay registros seleccionados o el usuario confirmó la exportación
            generatePatientPDF(patientInfo, selectedRecords, filteredHistory, filteredPatientHistory, selectedIds);
            toast.success("PDF generado correctamente");
        } catch (err) {
            toast.error("No se pudo generar el PDF");
        }
    };

    const isPediatric = patientInfo && patientInfo.age_group !== "Adulto";

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="flex flex-col items-center min-h-screen bg-white-100 p-16 overflow-auto">
            <h1 className="text-4xl font-bold mb-8 text-blue-600">Trazabilidad del paciente</h1>
            <div id="pdf-content" className="w-full flex flex-col items-center">
                {/* Filtros alineados horizontalmente */}
                <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium" htmlFor="startDate">Fecha de inicio:</label>
                        <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="p-2 border rounded w-40"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium" htmlFor="endDate">Fecha de fin:</label>
                        <input
                            type="date"
                            id="endDate"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="p-2 border rounded w-40"
                        />
                    </div>
                    <button
                        onClick={handleFilterHistory}
                        className="px-4 py-2 bg-blue-500 text-white font-semibold rounded flex items-center space-x-2 hover:bg-blue-600 transition"
                    >
                        <FaFilter className="text-sm" />
                        <span>Filtrar</span>
                    </button>
                    <button
                        onClick={() => {
                            setStartDate("");
                            setEndDate("");
                            setFilteredHistory(history); // Restaura el historial completo
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 font-semibold rounded flex items-center space-x-2 hover:bg-gray-400 transition"
                    >
                        <FaTimes className="text-sm" />
                        <span>Limpiar Filtros</span>
                    </button>
                </div>

                {/* Historial del Paciente */}
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-7xl mb-6 overflow-x-auto">
                    <h2 className="text-2xl font-bold mb-4 text-center text-gray-700 border-b-2 border-gray-300 pb-2">
                        Historial de cambios del paciente
                    </h2>

                    {filteredHistory.length > 0 ? (

                        <table className="w-full border-collapse table-auto text-sm text-center">
                            <thead>
                                <tr className="bg-blue-100">
                                    <th className="p-3 border-b-2">Fecha de Registro</th>
                                    <th className="p-3 border-b-2">Hora de Registro</th>
                                    <th className="p-3 border-b-2">Primer Nombre</th>
                                    <th className="p-3 border-b-2">Segundo Nombre</th>
                                    <th className="p-3 border-b-2">Primer Apellido</th>
                                    <th className="p-3 border-b-2">Segundo Apellido</th>
                                    <th className="p-3 border-b-2">Tipo de Identificación</th>
                                    <th className="p-3 border-b-2">Número de Identificación</th>
                                    <th className="p-3 border-b-2">Ubicación</th>
                                    <th className="p-3 border-b-2">Fecha de Nacimiento</th>
                                    <th className="p-3 border-b-2">Estado</th>
                                    <th className="p-3 border-b-2">Tipo de paciente</th>
                                    <th className="p-3 border-b-2">Responsable</th>

                                </tr>
                            </thead>
                            <tbody>

                                {filteredHistory.map((record, index) => {
                                    const { date, time } = formatDateTime(record.created_at);
                                    const nextRecord = history[index + 1] || {};
                                    return (
                                        <tr key={index} className={`text-center ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                                            <td className={`p-3 border ${isModified(formatDate(record.created_at.split('T')[0]), formatDate(nextRecord.created_at?.split('T')[0])) ? "bg-green-300" : ""}`}>{date}</td>
                                            <td className={`p-3 border ${isModified(record.created_at.split('T')[1], nextRecord.created_at?.split('T')[1]) ? "bg-green-300" : ""}`}>{time}</td>
                                            <td className={`p-3 border ${isModified(record.primer_nombre, nextRecord.primer_nombre) ? "bg-green-300" : ""}`}>{record.primer_nombre}</td>
                                            <td className={`p-3 border ${isModified(record.segundo_nombre, nextRecord.segundo_nombre) ? "bg-green-300" : ""}`}>{record.segundo_nombre}</td>
                                            <td className={`p-3 border ${isModified(record.primer_apellido, nextRecord.primer_apellido) ? "bg-green-300" : ""}`}>{record.primer_apellido}</td>
                                            <td className={`p-3 border ${isModified(record.segundo_apellido, nextRecord.segundo_apellido) ? "bg-green-300" : ""}`}>{record.segundo_apellido}</td>
                                            <td className={`p-3 border ${isModified(record.tipo_identificacion, nextRecord.tipo_identificacion) ? "bg-green-300" : ""}`}>{record.tipo_identificacion}</td>
                                            <td className={`p-3 border ${isModified(record.numero_identificacion, nextRecord.numero_identificacion) ? "bg-green-300" : ""}`}>{record.numero_identificacion}</td>
                                            <td className={`p-3 border ${isModified(record.ubicacion, nextRecord.ubicacion) ? "bg-green-300" : ""}`}>{record.ubicacion}</td>
                                            <td className={`p-3 border ${isModified(record.fecha_nacimiento, nextRecord.fecha_nacimiento) ? "bg-green-300" : ""}`}>{formatDate(record.fecha_nacimiento)}</td>
                                            <td className={`p-3 border font-bold ${record.status === "activo" ? "text-green-500" : "text-red-500"}`}>{record.status}</td>
                                            <td className={`p-3 border ${isModified(record.age_group, nextRecord.age_group) ? "bg-green-300" : ""}`}>{record.age_group}</td>
                                            <td className={`p-3 border ${isModified(record.responsable_registro, nextRecord.responsable_registro) ? "bg-green-300" : ""}`}>{record.responsable_registro}</td>

                                        </tr>
                                    );
                                })}
                            </tbody>

                        </table>
                    ) : (
                        <div className="text-center text-gray-500">No hay registros en el historial del paciente.</div>
                    )}
                </div>
                {/* Filtro por ID */}
                <div className="mb-4">
                    <input
                        type="text"
                        value={searchId}
                        onChange={handleSearchIdChange}
                        placeholder="Buscar por ID de Registro"
                        className="p-2 border rounded w-full max-w-md"
                    />
                </div>
                {/* Signos Vitales */}
                <div className="bg-white p-6 rounded shadow-lg w-full max-w-7xl mb-6 overflow-x-auto">
                    <h2 className="text-2xl font-bold mb-4 text-center text-gray-700 border-b-2 border-gray-300 pb-2">
                        Historial de cambios de los Signos Vitales
                    </h2>
                    {filteredPatientHistory.length > 0 ? (

                        <table className="w-full border-collapse table-auto text-sm">
                            <thead>
                                <tr className="bg-blue-100">
                                    <th className="p-3 border-b-2">Seleccionar</th>
                                    <th className="p-3 border-b-2">Id del registro</th>
                                    <th className="p-3 border-b-2">Fecha</th>
                                    <th className="p-3 border-b-2">Hora</th>
                                    <th className="p-3 border-b-2">Pulso</th>
                                    <th className="p-3 border-b-2">Temperatura</th>
                                    <th className="p-3 border-b-2">FR</th>
                                    <th className="p-3 border-b-2">TAS</th>
                                    <th className="p-3 border-b-2">TAD</th>
                                    <th className="p-3 border-b-2">TAM</th>
                                    <th className="p-3 border-b-2">SatO2</th>
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

                                {filteredPatientHistory.map((currentRecord, index) => {
                                    const prevRecord = index > 0 ? filteredPatientHistory[index - 1] : null;

                                    return (

                                        <tr key={currentRecord.id_registro} className="text-center">
                                            <td className="p-3 border">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(currentRecord.id_registro)}
                                                    onChange={() => handleSelectRecord(currentRecord.id_registro)}
                                                />
                                            </td>
                                            <td className="p-3 border">{currentRecord.id_registro}</td>
                                            <td className={`p-3 border ${getChangedClass("record_date", currentRecord, prevRecord)}`}>{formatDate(currentRecord.record_date)}</td>
                                            <td className={`p-3 border ${getChangedClass("record_time", currentRecord, prevRecord)}`}>{currentRecord.record_time}</td>
                                            <td className={`p-3 border ${getChangedClass("pulso", currentRecord, prevRecord)}`}>{currentRecord.pulso}</td>
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
                    ) : (
                        <div className="text-center text-gray-500">No hay registros en el historial de signos vitales.</div>

                    )}
                </div>

                {/* Botones de acción */}
                <div className="flex justify-center w-full max-w-7xl mt-6 space-x-4">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                    >
                        <FiHome className="mr-2" /> Regresar
                    </button>
                    <button
                        onClick={() => setSelectedIds(new Set())} // Limpia todas las selecciones
                        className="flex items-center px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                    >
                        <FiX className="mr-2" /> Quitar Selecciones
                    </button>
                    <button
                        onClick={() => {
                            const allIds = new Set(filteredPatientHistory.map(record => record.id_registro));
                            setSelectedIds(allIds); // Selecciona todos los registros visibles
                        }}
                        className="flex items-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
                    >
                        <FiPlusCircle className="mr-2" /> Seleccionar Todo
                    </button>
                    <button
                        onClick={exportPDF}
                        className="flex items-center px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                    >
                        <FiDownload className="mr-2" /> Exportar PDF
                    </button>
                </div>
            </div >
        </div >
    );
};

export default PatientHistoryPage;