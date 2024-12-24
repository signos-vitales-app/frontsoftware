import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPatientRecord, fetchPatientInfo } from "../services/patientService";
import { FiSave, FiClipboard } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PatientDataForm = () => {
    const { idPaciente } = useParams();
    const navigate = useNavigate();

    const currentDate = new Date().toLocaleDateString("en-CA");
    const currentTime = new Date().toTimeString().split(" ")[0].slice(0, 5);

    const [ageGroup, setAgeGroup] = useState("");
    const [recordDate, setRecordDate] = useState(currentDate);
    const [recordTime, setRecordTime] = useState(currentTime);
    const [pesoAdulto, setPesoAdulto] = useState("");
    const [pesoPediatrico, setPesoPediatrico] = useState("");
    const [talla, setTalla] = useState("");
    const [presionSistolica, setPresionSistolica] = useState("");
    const [presionDiastolica, setPresionDiastolica] = useState("");
    const [presionMedia, setPresionMedia] = useState("");
    const [pulso, setPulso] = useState("");
    const [frecuenciaRespiratoria, setFrecuenciaRespiratoria] = useState("");
    const [saturacionOxigeno, setSaturacionOxigeno] = useState("");
    const [temperatura, setTemperatura] = useState("");
    const [observaciones, setObservations] = useState("");

    useEffect(() => {
        const loadPatientInfo = async () => {
            try {
                const response = await fetchPatientInfo(idPaciente);
                const patient = response.data;
                setAgeGroup(patient.age_group || ""); // Establecer el grupo de edad desde el backend
            } catch (error) {
                console.error("Error al recuperar la información del paciente:", error);
                toast.error("Error al recuperar la información del paciente.");
            }
        };
        loadPatientInfo();
    }, [idPaciente]);

    useEffect(() => {
        const sistolica = parseFloat(presionSistolica);
        const diastolica = parseFloat(presionDiastolica);

        if (!isNaN(sistolica) && !isNaN(diastolica)) {
            const tam = ((sistolica + 2 * diastolica) / 3).toFixed(0);
            console.log("Presión Media Calculada:", tam);
            setPresionMedia(tam);
        } else {
            setPresionMedia("");
        }
    }, [presionSistolica, presionDiastolica]); // Se ejecuta cada vez que cambian estos estados

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Token no encontrado. Por favor inicia sesión nuevamente.");
            return;
        }
        try {
            await createPatientRecord({
                id_paciente: idPaciente,
                record_date: recordDate,
                record_time: recordTime,
                presion_sistolica: presionSistolica,
                presion_diastolica: presionDiastolica,
                presion_media: presionMedia,
                pulso,
                temperatura,
                frecuencia_respiratoria: frecuenciaRespiratoria,
                saturacion_oxigeno: saturacionOxigeno,
                peso_adulto: ageGroup === "Adulto" ? pesoAdulto : null,
                peso_pediatrico: ageGroup !== "Adulto" ? pesoPediatrico : null,
                talla,
                observaciones,
            },
                token
            );
            toast.success("¡Los datos del paciente se guardaron correctamente!");
            navigate(`/patient/${idPaciente}/records`);
        } catch (error) {
            console.error("Error al guardar los datos del paciente:", error);
            const errorMessage =
                error.response?.data?.message || "Error al guardar los datos del paciente.";
            toast.error(errorMessage);
        }
    };

    if (!ageGroup) {
        return <div>Cargando información del paciente...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-5">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600 mb-6">
                🩺 Monitoreo General
            </h1>
            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg grid gap-4"
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Fecha Dato:</label>
                        <input
                            type="date"
                            value={recordDate}
                            onChange={(e) => setRecordDate(e.target.value)}
                            max={currentDate}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Hora Dato:</label>
                        <input
                            type="time"
                            value={recordTime}
                            onChange={(e) => setRecordTime(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Peso Adulto (kg):</label>
                        <input
                            type="number"
                            value={pesoAdulto}
                            onChange={(e) => setPesoAdulto(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Talla (cm):</label>
                        <input
                            type="number"
                            value={talla}
                            onChange={(e) => setTalla(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Temperatura (°C):</label>
                        <input
                            type="number"
                            value={temperatura}
                            onChange={(e) => setTemperatura(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Presión Sistólica (mmHg):</label>
                        <input
                            type="number"
                            value={presionSistolica}
                            onChange={(e) => setPresionSistolica(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Presión Diastólica (mmHg):</label>
                        <input
                            type="number"
                            value={presionDiastolica}
                            onChange={(e) => setPresionDiastolica(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Presión Media (mmHg):</label>
                        <input
                            type="number"
                            value={presionMedia}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Pulso (lat/min):</label>
                        <input
                            type="number"
                            value={pulso}
                            onChange={(e) => setPulso(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Frecuencia Respiratoria (resp/min):</label>
                        <input
                            type="number"
                            value={frecuenciaRespiratoria}
                            onChange={(e) => setFrecuenciaRespiratoria(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">SatO2 (%):</label>
                        <input
                            type="number"
                            value={saturacionOxigeno}
                            onChange={(e) => setSaturacionOxigeno(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-gray-700 font-medium mb-1">Observaciones:</label>
                    <textarea
                        value={observaciones}
                        onChange={(e) => setObservations(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    ></textarea>
                </div>

                <div className="flex justify-center gap-4 mt-2">
                    <button
                        type="submit"
                        className="flex items-center px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-green-600 shadow-md transition"
                    >
                        <FiSave className="mr-2" />
                        Guardar Datos
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex items-center px-6 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 shadow-md transition"
                    >
                        <FiClipboard className="mr-2" />
                        Ver registros anteriores
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientDataForm;