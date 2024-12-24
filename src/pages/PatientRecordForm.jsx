import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPatientRecord } from "../services/patientService";

const PatientRecordForm = () => {
    const { idPaciente } = useParams();
    const navigate = useNavigate();

    const [recordDate, setRecordDate] = useState("");
    const [recordTime, setRecordTime] = useState("");
    const [presionSistolica, setPresionSistolica] = useState("");
    const [presionDiastolica, setPresionDiastolica] = useState("");
    const [presionMedia, setPresionMedia] = useState("");
    const [pulso, setPulso] = useState("");
    const [temperatura, setTemperatura] = useState("");
    const [frecuenciaRespiratoria, setFrecuenciaRespiratoria] = useState("");
    const [saturacionOxigeno, setSaturacionOxigeno] = useState("");
    const [pesoAdulto, setPesoAdulto] = useState("");
    const [pesoPediatrico, setPesoPediatrico] = useState("");
    const [talla, setTalla] = useState("");
    const [observaciones, setObservations] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
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
                peso_adulto: pesoAdulto,
                peso_pediatrico: pesoPediatrico,
                talla,
                observaciones
            });
            alert("Registro de paciente guardado exitosamente!");
            navigate(`/patient/${idPaciente}`);
        } catch (error) {
            console.error("Error al crear el registro del paciente", error);
            alert("No se pudo crear el registro del paciente.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 overflow-auto">
            <h1 className="text-2xl font-bold mb-6">Agregar nuevo registro</h1>
            <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 rounded shadow-md">
                {/* Campos similares a los de PatientRegister para capturar los datos en el historial del paciente */}
                <div className="mb-4">
                    <label>Fecha</label>
                    <input
                        type="date"
                        value={recordDate}
                        onChange={(e) => setRecordDate(e.target.value)}
                        required
                        className="w-full p-2 border rounded"
                    />
                </div>
                {/* Otros campos de entrada aquí, similares al formulario original de PatientRegister */}
                <button type="submit" className="w-full p-3 bg-green-500 text-white font-bold rounded hover:bg-green-600 transition">
                    Guardar
                </button>
            </form>
        </div>
    );
};

export default PatientRecordForm;
