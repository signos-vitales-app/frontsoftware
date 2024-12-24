import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPatientRecords } from "../services/patientService";
import { FiPlusCircle, FiHome, FiFilter, FiDownload, FiEdit } from "react-icons/fi";
import { FaTimes } from "react-icons/fa"
import { MdOutlinePublishedWithChanges } from "react-icons/md";
import { format } from "date-fns";
import VitalSignsChart from "./VitalSignsChart";
import "jspdf-autotable";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";
import generatePDF from "../services/generatePDF";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { getUserInfo } from '../services/authService';

const PatientRecordHistory = () => {
    //Datos del paciente
    const { idPaciente } = useParams();
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [filteredRecords, setFilteredRecords] = useState([]);
    const [patientInfo, setPatientInfo] = useState({});
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedVariables, setSelectedVariables] = useState(["pulso", "temperatura", "frecuencia_respiratoria", "presion_sistolica", "presion_diastolica", "saturacion_oxigeno"
    ]);
    const [edad, setEdad] = useState(null);
    const [ageUnit, setAgeUnit] = useState(""); // Unidad de edad: años o meses
    const [ageGroup, setAgeGroup] = useState(""); // Tipo de paciente
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState(''); // Estado para el nombre de usuario
    const [showNormalValues, setShowNormalValues] = useState(false);
    const [showColorSemantics, setShowColorSemantics] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserInfo(); // Obtén la información del usuario
                setUsername(response.data.username); // Establece el nombre de usuario
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo(); // Llama a la función al montar el componente
    }, []);

    //Tabla y grafico de signos
    const tableRef = useRef(null);
    const chartRef = useRef(null);
    //Solo permitir el rol del jefe 
    const role = localStorage.getItem('role');
    useEffect(() => {
        loadPatientRecords();
    }, []); // Se ejecuta una sola vez cuando la página se carga

    // Función para calcular la edad en años
    const calculateAge = (date) => {
        if (!date) return null;
        const birth = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    // Función para calcular la edad en meses
    const calculateAgeInMonths = (date) => {
        if (!date) return null;
        const birth = new Date(date);
        const today = new Date();
        const ageInMonths =
            (today.getFullYear() - birth.getFullYear()) * 12 +
            (today.getMonth() - birth.getMonth()) -
            (today.getDate() < birth.getDate() ? 1 : 0);
        return ageInMonths;
    };

    // Función para calcular el grupo de edad
    const calculateAgeGroup = (fechaNacimiento) => {
        const birth = new Date(fechaNacimiento);
        const today = new Date();
        const ageInMonths =
            (today.getFullYear() - birth.getFullYear()) * 12 +
            (today.getMonth() - birth.getMonth()) -
            (today.getDate() < birth.getDate() ? 1 : 0);

        if (ageInMonths >= 0 && ageInMonths <= 3) return 'Recién nacido';
        if (ageInMonths > 3 && ageInMonths <= 6) return 'Lactante temprano';
        if (ageInMonths > 6 && ageInMonths <= 12) return 'Lactante mayor';
        if (ageInMonths > 12 && ageInMonths <= 36) return 'Niño pequeño';
        if (ageInMonths > 36 && ageInMonths <= 72) return 'Preescolar temprano';
        if (ageInMonths > 72 && ageInMonths <= 180) return 'Preescolar tardío';
        return 'Adulto';
    };

    // Maneja el cambio de la fecha de nacimiento
    const handleFechaNacimientoChange = (date) => {
        const ageInYears = calculateAge(date);
        const ageInMonths = calculateAgeInMonths(date);

        if (ageInYears >= 1) {
            setEdad(ageInYears);
            setAgeUnit("años");
        } else {
            setEdad(ageInMonths);
            setAgeUnit("meses");
        }

        // Calcular el grupo de edad
        const group = calculateAgeGroup(date);
        setAgeGroup(group);
    };

    // Cargar los registros del paciente
    const loadPatientRecords = async () => {
        try {
            const response = await fetchPatientRecords(idPaciente);
            let records = response.data.records;

            // Ordenar los registros por fecha y hora
            records = records.sort((a, b) => {
                const dateA = new Date(a.record_date);
                const dateB = new Date(b.record_date);

                if (dateA.getTime() === dateB.getTime()) {
                    const timeA = a.record_time.split(':');
                    const timeB = b.record_time.split(':');

                    const minutesA = parseInt(timeA[0]) * 60 + parseInt(timeA[1]);
                    const minutesB = parseInt(timeB[0]) * 60 + parseInt(timeB[1]);
                    return minutesA - minutesB;
                }

                return dateA - dateB;
            });

            setRecords(records);
            setFilteredRecords(records);
            const patient = response.data.patient;
            setPatientInfo(patient);

            // Calcular la edad y el grupo de edad
            handleFechaNacimientoChange(patient.fecha_nacimiento);

            setLoading(false);
        } catch (error) {
            console.error("Error al recuperar registros de pacientes", error);
            setLoading(false);
        }
    };

    const handleFilter = () => {
        // Filtrar los registros según las fechas
        let filtered = records.filter(record => {
            const recordDate = new Date(record.record_date);
            const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
            const end = endDate ? new Date(`${endDate}T23:59:59`) : null;
            return (!start || recordDate >= start) && (!end || recordDate <= end);
        });

        // Ordenar los registros filtrados por fecha
        filtered = filtered.sort((a, b) => new Date(a.record_date) - new Date(b.record_date));

        // Filtrar las variables seleccionadas
        const filteredWithVariables = filtered.map(record => {
            const filteredRecord = {};
            selectedVariables.forEach(variable => {
                filteredRecord[variable] = record[variable];
            });
            return { ...record, ...filteredRecord };
        });

        // Actualizar el estado de los registros filtrados
        setFilteredRecords(filteredWithVariables);
    };

    const handleClearFilters = () => {
        setStartDate(""); // Restablecer campo de fecha inicio
        setEndDate("");    // Restablecer campo de fecha fin
        setFilteredRecords(records)
    };

    const toggleVariable = (variable) => {
        setSelectedVariables(prev =>
            prev.includes(variable)
                ? prev.filter(v => v !== variable)
                : [...prev, variable]
        );
    };

    const handleNewRecord = () => {
        if (patientInfo.status !== "activo") {
            toast.error("No se pueden agregar registros para pacientes inactivos.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } else {
            navigate(`/patient/${idPaciente}/add-record`);
        }
    };

    const handleGoBack = () => {
        navigate("/search-patient");
    };

    // Etiquetas amigables para las variables
    const variableLabels = {
        pulso: "Pulso",
        temperatura: "Temperatura",
        frecuencia_respiratoria: "Frecuencia Respiratoria",
        presion_sistolica: "Presión Sistólica",
        presion_diastolica: "Presión Diastólica",
        saturacion_oxigeno: "SatO2",
        peso_pediatrico: "Peso Pediátrico",
        peso_adulto: "Peso Adulto",
        presion_media: "Presión Media"
    };

    // Rango de signos vitales por grupo de edad
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

    const handleExportPDF = async () => {
        if (!chartRef.current) {
            console.error("El chartRef no está asignado correctamente.");
            return;
        }
        try {
            await generatePDF(patientInfo, edad, ageUnit, ageGroup, filteredRecords, chartRef.current, chartRef, role);
        } catch (error) {
            console.error("Error al generar el PDF", error);
        }
    };

    // Función para obtener el fondo basado en el valor y el grupo de edad
    const getVitalSignBackground = (ageGroup, vitalSign, value) => {
        const range = vitalSignRanges[vitalSign][ageGroup];
        if (!range) return 'bg-white'; // Si no hay rango definido, se deja en blanco por defecto

        if (value < range.min) return 'bg-[rgb(120,190,230)]'; // Azul si el valor es bajo
        if (value > range.max) return 'bg-red-300'; // Rojo si el valor es alto
        return 'bg-white'; // Blanco si el valor está dentro del rango normal
    };

    const handleRedirect = () => {
        navigate(`/patient-history/${idPaciente}`); // Incluye el idPaciente en la ruta
    };
    const handleEditRecord = (idRegistro) => {
        navigate(`/patient/${idPaciente}/edit-record/${idRegistro}`);
    };
    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    return (
        <div className="flex flex-col items-center min-h-screen bg-white-50 p-14 pl-70 overflow-auto">
            {/* Título principal */}
            <h1 className="text-4xl font-extrabold text-blue-800 mb-10">
                <span className="text-blue-500">📑</span> Historial del Paciente
            </h1>

            {/* Información Personal */}
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-7xl mb-10">
                {/* Encabezado con botón de estado */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-2xl text-blue-600 underline decoration-blue-400">
                        Información Personal
                    </h3>
                    <span
                        className={`px-6 py-2 rounded-full font-bold text-white text-sm shadow-md ${patientInfo.status === "activo" ? "bg-green-500" : "bg-red-500"
                            }`}
                    >
                        Paciente {patientInfo.status === "activo" ? "Activo" : "Inactivo"}
                    </span>
                </div>

                {/* Contenido: Tabla y Notas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Tabla de información */}
                    <table className="w-full border-collapse border border-gray-200 text-sm text-gray-700 rounded-lg overflow-hidden shadow-md">
                        <tbody>
                            <tr className="border-b border-gray-200 bg-gray-100">
                                <td className="font-bold py-3 px-4">Nombre:</td>
                                <td className="py-3 px-4">
                                    {patientInfo.primer_nombre} {patientInfo.segundo_nombre}{" "}
                                    {patientInfo.primer_apellido} {patientInfo.segundo_apellido}
                                </td>
                            </tr>
                            <tr className="border-b border-white-400 bg-white-100">
                                <td className="font-bold py-3 px-4">Tipo de Identificación:</td>
                                <td className="py-3 px-4">{patientInfo.tipo_identificacion}</td>
                            </tr>
                            <tr className="border-b border-gray-200 bg-gray-100">
                                <td className="font-bold py-3 px-4">Número de Identificación:</td>
                                <td className="py-3 px-4">{patientInfo.numero_identificacion}</td>
                            </tr>
                            <tr className="border-b border-white-200 bg-white-100">
                                <td className="font-bold py-3 px-4">Fecha de Nacimiento:</td>
                                <td className="py-3 px-4">
                                    {new Date(patientInfo.fecha_nacimiento).toLocaleDateString()}
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200 bg-gray-100">
                                <td className="font-bold py-3 px-4">Edad:</td>
                                <td className="py-3 px-4">{edad ? `${edad} ${ageUnit}` : "No disponible"}</td>
                            </tr>
                            <tr className="border-b border-white-200 bg-white-100">
                                <td className="font-bold py-3 px-4">Tipo de Paciente:</td>
                                <td className="py-3 px-4">{ageGroup || "No definido"}</td>
                            </tr>
                            <tr className="border-b border-gray-200 bg-gray-100">
                                <td className="font-bold py-3 px-4">Ubicación:</td>
                                <td className="py-3 px-4">{patientInfo.ubicacion}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Nota informativa mejorada */}
                    <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                        <div className="flex items-center space-x-3 mb-6">
                            {/* Emoji al lado del título */}
                            <span className="text-3xl text-blue-600">ℹ️</span>
                            <h4 className="font-bold text-2xl text-blue-600">
                                Información
                            </h4>
                        </div>
                        <ul className="list-none text-sm text-gray-800 leading-relaxed space-y-6">
                            {/* Cada ítem con icono al inicio para destacar */}
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-3 text-lg">✔️</span>
                                <p className="text-justify">
                                    Gestiona los registros de <span className="font-semibold text-blue-600">signos vitales</span> del paciente, incluyendo <span className="font-semibold">talla</span> y <span className="font-semibold">peso</span>.
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-3 text-lg">📈</span>
                                <p className="text-justify">
                                    Selecciona las variables de los signos vitales que deseas visualizar en la <span className="font-semibold text-blue-600">gráfica</span>.
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-3 text-lg">📤</span>
                                <p className="text-justify">
                                    Exporta los registros en formato <span className="font-semibold">PDF</span> y <span className="font-semibold">TXT</span> para un análisis detallado y respaldo de la información.
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-3 text-lg">⚠️</span>
                                <p className="text-justify">
                                    Utiliza los botones de <span className="font-semibold text-blue-600">Valores Normales</span> y <span className="font-semibold text-blue-600">Semaforización</span> para consultar rangos y alertas de valores críticos.
                                </p>
                            </li>
                            <li className="flex items-start">
                                <span className="text-blue-500 mr-3 text-lg">📅</span>
                                <p className="text-justify">
                                    Filtra los registros por <span className="font-semibold">fecha</span> y edítalos según sea necesario.
                                </p>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Registros */}
            < div className="bg-white p-6 rounded-lg shadow-md w-full max-w-7xl relative" >
                <h2 className="font-bold text-2xl text-blue-600 text-center mb-6 flex items-center justify-center gap-2"> Registros</h2>

                {/* Botones de "Valores Normales" y "Semaforización" */}
                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        onClick={() => setShowNormalValues((prev) => !prev)}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-purple-600 transition"
                    >
                        📘 Valores Normales
                    </button>
                    <button
                        onClick={() => setShowColorSemantics((prev) => !prev)}
                        className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-purple-600 transition"
                    >
                        🎨 Semaforización
                    </button>
                </div>

                {/* Mostrar contenido de "Valores Normales" */}
                {showNormalValues && (
                    <div className="relative mb-6 p-8 bg-white border border-gray-200 rounded-lg shadow-sm w-full max-w-4xl mx-auto animate-fade-in">
                        <h3 className="text-center text-2xl font-extrabold text-blue-600 mb-6">
                            Rangos de Signos Vitales
                        </h3>
                        <p className="text-center text-base text-gray-600 mb-8">
                            Hola, <span className="text-blue-500 font-semibold">{username}</span>. Estos son los valores normales según el tipo de paciente.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Pulso */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 shadow-md">
                                <span className="text-blue-500 text-xl">❤️</span>
                                <div>
                                    <h4 className="text-blue-500 font-bold text-base mb-2">Pulso</h4>
                                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                        <li>Recién nacido: 90-180 lpm</li>
                                        <li>Lactante temprano: 80-160 lpm</li>
                                        <li>Lactante mayor: 80-140 lpm</li>
                                        <li>Niño pequeño: 75-110 lpm</li>
                                        <li>Preescolar temprano: 70-110 lpm</li>
                                        <li>Preescolar tardío: 60-90 lpm</li>
                                        <li>Adulto: 60-90 lpm</li>
                                    </ul>
                                </div>
                            </div>
                            {/* Temperatura */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 shadow-md">
                                <span className="text-blue-500 text-xl">🌡️</span>
                                <div>
                                    <h4 className="text-blue-500 font-bold text-base mb-2">Temperatura</h4>
                                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                        <li>Recién nacido a Preescolar tardío: 36.0-37.5 °C</li>
                                        <li>Adulto: 36.5-37.5 °C</li>
                                    </ul>
                                </div>
                            </div>
                            {/* Frecuencia Respiratoria */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 shadow-md">
                                <span className="text-blue-500 text-xl">💨</span>
                                <div>
                                    <h4 className="text-blue-500 font-bold text-base mb-2">Frecuencia Respiratoria</h4>
                                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                        <li>Recién nacido: 30-60 rpm</li>
                                        <li>Lactante temprano: 30-60 rpm</li>
                                        <li>Lactante mayor: 24-40 rpm</li>
                                        <li>Niño pequeño y Preescolar tardío: 20-30 rpm</li>
                                        <li>Preescolar tardío: 16-24 rpm</li>
                                        <li>Adulto: 12-16 rpm</li>
                                    </ul>
                                </div>
                            </div>
                            {/* Presión Sistólica */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 shadow-md">
                                <span className="text-blue-500 text-xl">🫀</span>
                                <div>
                                    <h4 className="text-blue-500 font-bold text-base mb-2">Presión Sistólica</h4>
                                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                        <li>Recién nacido: 60-90 mmHg</li>
                                        <li>Lactante temprano: 80-100 mmHg</li>
                                        <li>Lactante mayor: 90-110 mmHg</li>
                                        <li>Niño pequeño: 95-110 mmHg</li>
                                        <li>Preescolar temprano: 100-120 mmHg</li>
                                        <li>Preescolar tardío: 105-120 mmHg</li>
                                        <li>Adulto: 100-140 mmHg</li>
                                    </ul>
                                </div>
                            </div>
                            {/* Presión Diastólica */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 shadow-md">
                                <span className="text-blue-500 text-xl">🫀</span>
                                <div>
                                    <h4 className="text-blue-500 font-bold text-base mb-2">Presión Diastólica</h4>
                                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                        <li>Recién nacido: 30-60 mmHg</li>
                                        <li>Lactante temprano: 50-70 mmHg</li>
                                        <li>Lactante mayor: 55-75 mmHg</li>
                                        <li>Niño pequeño: 60-75 mmHg</li>
                                        <li>Preescolar temprano: 65-80 mmHg</li>
                                        <li>Preescolar tardío: 70-85 mmHg</li>
                                        <li>Adulto: 60-90 mmHg</li>
                                    </ul>
                                </div>
                            </div>
                            {/* Presión Media */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 shadow-md">
                                <span className="text-blue-500 text-xl">📊</span>
                                <div>
                                    <h4 className="text-blue-500 font-bold text-base mb-2">Presión Media</h4>
                                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                        <li>Recién nacido: 50-70 mmHg</li>
                                        <li>Lactante temprano: 60-85 mmHg</li>
                                        <li>Lactante mayor: 70-95 mmHg</li>
                                        <li>Niño pequeño: 75-100 mmHg</li>
                                        <li>Preescolar temprano: 80-105 mmHg</li>
                                        <li>Preescolar tardío: 85-110 mmHg</li>
                                        <li>Adulto: 70-105 mmHg</li>
                                    </ul>
                                </div>
                            </div>
                            {/* Saturación de Oxígeno */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-start space-x-4 shadow-md col-span-2 flex justify-center">
                                <span className="text-blue-500 text-xl">🫁</span>
                                <div>
                                    <h4 className="text-blue-500 font-bold text-base mb-2">Saturación de Oxígeno</h4>
                                    <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
                                        <li>Todos los grupos: 95-100%</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p className="text-center text-xs mt-8 text-gray-500">
                            Estos valores son aproximados y pueden variar según el contexto médico.
                        </p>
                    </div>
                )
                }

                {/* Mostrar contenido de "Semaforización" */}
                {showColorSemantics && (
                    <div className="relative mb-8 p-4 bg-white border border-gray-300 rounded-lg shadow-lg w-full max-w-2xl mx-auto animate-fade-in">
                        {/* Encabezado del modal */}
                        <div className="flex items-center justify-center mb-6">
                            <h3 className="font-extrabold text-blue-500 text-2xl tracking-wider uppercase text-center">
                                Alarmas
                            </h3>
                        </div>
                        {/* Contenido principal */}
                        <ul className="text-sm space-y-6 flex flex-col items-center">
                            <li className="flex items-center justify-center">
                                <span className="inline-block w-6 h-6 bg-[rgb(120,190,230)] rounded-full mr-4 shadow-md"></span>
                                <span className="font-medium text-gray-700">Azul: Valor bajo del rango normal.</span>
                            </li>
                            <li className="flex items-center justify-center">
                                <span className="inline-block w-6 h-6 bg-red-400 rounded-full mr-4 shadow-md"></span>
                                <span className="font-medium text-gray-700">Rojo: Valor alto del rango normal.</span>
                            </li>
                            <li className="flex items-center justify-center">
                                <span className="inline-block w-6 h-6 bg-white border border-gray-300 rounded-full mr-4 shadow-md"></span>
                                <span className="font-medium text-gray-700">Blanco: Valor dentro del rango normal.</span>
                            </li>
                        </ul>
                        {/* Pie de página */}
                        <p className="text-sm mt-8 text-center text-gray-500 italic">
                            Los colores te ayudaran a identificar rápidamente los valores críticos o anómalos.
                        </p>
                    </div>
                )
                }

                {/* Filtros */}
                <div className="flex flex-wrap items-center justify-center space-x-4 mb-6">
                    <label className="mr-2 font-semibold">Fecha de inicio:</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="mx-2 font-semibold">Fecha de fin:</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 border rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleFilter}
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                    >
                        <FiFilter className="mr-2" /> Filtrar
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="flex items-center px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                    >
                        <FaTimes className="mr-2" /> Limpiar Filtros
                    </button>
                </div>

                {/* Tabla */}
                <div className="bg-white p-0 rounded-lg shadow-md w-full max-w-7xl overflow-x-auto">
                    <table className="table-auto w-full border-collapse rounded-lg overflow-hidden shadow">
                        <thead>
                            <tr className="bg-blue-400 text-white text-sm uppercase font-semibold tracking-wide">
                                <th className="p-1">Id</th>
                                <th className="p-1">Fecha</th>
                                <th className="p-1">Hora</th>
                                <th className="p-1">Pulso (lpm)</th>
                                <th className="p-2">T°C</th>
                                <th className="p-1">FR (RPM)</th>
                                <th className="p-1">TAS (mmHg)</th>
                                <th className="p-1">TAD (mmHg)</th>
                                <th className="p-1">TAM (mmHg)</th>
                                <th className="p-1">SatO2 (%)</th>
                                {/* Encabezado dinámico para el peso */}
                                <th className="p-3">
                                    {['Recién nacido', 'Lactante temprano', 'Lactante mayor', 'Niño pequeño', 'Preescolar temprano', 'Preescolar tardío'].includes(ageGroup)
                                        ? "Peso Pediátrico (kg)"
                                        : "Peso Adulto (kg)"}
                                </th>
                                <th className="p-1">Talla (cm)</th>
                                <th className="p-3 max-w-xs">Observaciones</th>
                                {role === "jefe" && <th className="p-1">Registrado por</th>}
                                <th className="p-1">Editar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map((record, index) => {
                                const recordDate = new Date(record.record_date);
                                const currentDate = new Date();
                                const isEditable = (currentDate - recordDate) / (1000 * 60 * 60 * 24) <= 1;
                                const handleForceEdit = async (id) => {
                                    const result = await Swal.fire({
                                        title: "¿Forzar edición?",
                                        text: "Este registro no es editable porque tiene más de 1 día. ¿Quieres continuar?",
                                        icon: "warning",
                                        showCancelButton: true,
                                        confirmButtonColor: "#d33",
                                        cancelButtonColor: "#3085d6",
                                        confirmButtonText: "Sí, editar",
                                        cancelButtonText: "Cancelar",
                                    });

                                    if (result.isConfirmed) {
                                        handleEditRecord(id);
                                    }
                                };

                                return (
                                    <tr
                                        key={index}
                                        className={`text-center ${index % 2 === 0 ? "bg-white" : "bg-white-100"}`}
                                    >
                                        <td className="p-3 border text-center">{record.id}</td>
                                        <td className="p-3 border text-center">{format(new Date(record.record_date), "dd/MM/yyyy")}</td>
                                        <td className="p-3 border text-center">{record.record_time}</td>
                                        <td className={`p-3 border text-center ${getVitalSignBackground(ageGroup, 'pulso', record.pulso)}`}>
                                            {record.pulso}
                                        </td>
                                        <td className={`p-3 border text-center ${getVitalSignBackground(ageGroup, 'temperatura', record.temperatura)}`}>
                                            {record.temperatura}
                                        </td>
                                        <td className={`p-3 border text-center ${getVitalSignBackground(ageGroup, 'frecuencia_respiratoria', record.frecuencia_respiratoria)}`}>
                                            {record.frecuencia_respiratoria}
                                        </td>
                                        <td className={`p-3 border text-center ${getVitalSignBackground(ageGroup, 'presion_sistolica', record.presion_sistolica)}`}>
                                            {record.presion_sistolica}
                                        </td>
                                        <td className={`p-3 border text-center ${getVitalSignBackground(ageGroup, 'presion_diastolica', record.presion_diastolica)}`}>
                                            {record.presion_diastolica}
                                        </td>
                                        <td className={`p-3 border text-center ${getVitalSignBackground(ageGroup, 'presion_media', record.presion_media)}`}>
                                            {record.presion_media}
                                        </td>
                                        <td className={`p-3 border text-center ${getVitalSignBackground(ageGroup, 'saturacion_oxigeno', record.saturacion_oxigeno)}`}>
                                            {record.saturacion_oxigeno}
                                        </td>
                                        <td className="p-3 border text-center">
                                            {['Recién nacido', 'Lactante temprano', 'Lactante mayor', 'Niño pequeño', 'Preescolar temprano', 'Preescolar tardío'].includes(ageGroup)
                                                ? record.peso_pediatrico
                                                : record.peso_adulto}
                                        </td>
                                        <td className="p-3 border text-center">{record.talla || "-"}</td>
                                        <td className="p-3 border text-center">
                                            {record.observaciones || "-"}
                                        </td>
                                        {role === "jefe" && (
                                            <td className="p-3 border text-center">{record.responsable_signos || "No disponible"}</td>)}

                                        {/* Botón de editar */}
                                        <td className="p-3 border text-center">
                                            {isEditable ? (
                                                <button
                                                    onClick={() => handleEditRecord(record.id)}
                                                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-green-600 transition"
                                                >
                                                    <FiEdit className="mr-2" /> Editar
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleForceEdit(record.id)}
                                                    className="flex items-center px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                >
                                                    <FiEdit className="mr-2" /> Forzar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-evenly w-full mt-6 space-x-4">
                    <button
                        onClick={handleNewRecord}
                        className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
                    >
                        <FiPlusCircle className="mr-2" /> Agregar Registro
                    </button>

                    <button
                        onClick={handleExportPDF}
                        className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-green-600 transition"
                    >
                        <FiDownload className="mr-2" /> Exportar como PDF
                    </button>

                    {role === "jefe" && (
                        <button
                            onClick={handleRedirect}
                            className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
                        >
                            <MdOutlinePublishedWithChanges className="mr-2" /> Ver Historial de Cambios
                        </button>
                    )}

                    <button
                        onClick={handleGoBack}
                        className="flex items-center justify-center px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-blue-600 transition"
                    >
                        <FiHome className="mr-2" /> Regresar
                    </button>
                </div>
            </div >

            {/* Variables para graficar */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-lg w-full max-w-7xl mt-6 mb-6">
                <h3 className="font-bold text-2xl text-blue-600 text-center mb-6 flex items-center justify-center gap-2">
                    📊 <span>Variables para graficar</span>
                </h3>
                <div className="flex justify-center flex-wrap gap-6">
                    {[
                        "pulso",
                        "temperatura",
                        "frecuencia_respiratoria",
                        "presion_sistolica",
                        "presion_diastolica",
                        "saturacion_oxigeno"
                    ].map(variable => (
                        <label
                            key={variable}
                            className="flex items-center bg-white p-4 rounded-lg shadow-md border border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-transform transform hover:scale-105"
                        >
                            <input
                                type="checkbox"
                                checked={selectedVariables.includes(variable)}
                                onChange={() => toggleVariable(variable)}
                                className="mr-3 accent-blue-500 w-5 h-5"
                            />
                            <span className="text-gray-700 font-medium text-sm">
                                {variableLabels[variable]}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Gráfico de Signos Vitales */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md w-full max-w-7xl mb-6" ref={chartRef}>
                <div className="text-center mb-4">
                    <h4 className="font-bold text-2xl text-blue-600 text-center mb-6 flex items-center justify-center gap-2">
                        <span>📈</span>
                        <span>Gráficos generados</span>
                    </h4>
                    <p className="text-gray-600 text-sm mt-2">
                        Visualiza las tendencias de los signos vitales seleccionados para un análisis más detallado.
                    </p>
                </div>
                <div className="p-0">
                    <VitalSignsChart records={filteredRecords} selectedVariables={selectedVariables} />
                </div>
            </div>
        </div>
    );
};

export default PatientRecordHistory;