import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPatientRecord, updatePatientRecord, fetchPatientInfo } from "../services/patientService";
import { FiSave } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditPatientDataForm = () => {
    const { idRegistro, idPaciente } = useParams();
    const navigate = useNavigate();

    const currentDate = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].slice(0, 5);

    const [formData, setFormData] = useState({
        record_date: "",
        record_time: "",
        presion_sistolica: "",
        presion_diastolica: "",
        presion_media: "",
        pulso: "",
        temperatura: "",
        frecuencia_respiratoria: "",
        saturacion_oxigeno: "",
        peso_adulto: "",
        peso_pediatrico: "",
        talla: "",
        observaciones: "",
    });

    const [ageGroup, setAgeGroup] = useState(""); // Estado para el grupo de edad

    useEffect(() => {
        const loadRecord = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Token no encontrado. Por favor inicia sesión nuevamente.");
                    return;
                }
                const data = await fetchPatientRecord(idRegistro, token);
                console.log("Registro cargado:", data);
                const formattedDate = data.record_date ? data.record_date.split("T")[0] : "";
                setFormData({
                    ...data,
                    record_date: formattedDate,
                });
            } catch (error) {
                console.error("Error al cargar el registro del paciente:", error);
                toast.error("Error al cargar el registro del paciente.");
            }
        };

        const loadPatientInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("Token no encontrado. Por favor inicia sesión nuevamente.");
                    return;
                }
                const response = await fetchPatientInfo(idPaciente, token);
                const patient = response.data;
                console.log('Grupo de edad del paciente:', patient.age_group);
                setAgeGroup(patient.age_group || "");
            } catch (error) {
                console.error("Error al recuperar la información del paciente:", error);
                toast.error("Error al recuperar la información del paciente.");
            }
        };

        loadRecord();
        loadPatientInfo();
    }, [idRegistro, idPaciente]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "presion_sistolica" || name === "presion_diastolica") {
            calculatePresionMedia({ ...formData, [name]: value });
        }
    };

    const calculatePresionMedia = (data) => {
        const sistolica = parseInt(data.presion_sistolica, 10);
        const diastolica = parseInt(data.presion_diastolica, 10);

        if (!isNaN(sistolica) && !isNaN(diastolica)) {
            const tam = ((sistolica + 2 * diastolica) / 3).toFixed(0);
            setFormData((prev) => ({ ...prev, presion_media: tam }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        console.log("Datos a enviar:", formData); // Verifica los datos
        console.log("Token:", token); // Verifica el token

        if (!token) {
            toast.error("Token no encontrado. Por favor inicia sesión nuevamente.");
            return;
        }

        // Validación para asegurarse de que la fecha y la hora sean actuales
        const currentDate = new Date().toLocaleDateString("en-CA");
        const currentTime = new Date().toTimeString().split(" ")[0].slice(0, 5);

        if (formData.record_date !== currentDate || formData.record_time !== currentTime) {
            setFormData((prevData) => ({
                ...prevData,
                record_date: currentDate,
                record_time: currentTime,
            }));
            toast.error("La fecha y la hora deben ser las actuales.");
            return;
        }
        try {
            await updatePatientRecord(idRegistro, formData, token);
            toast.success("¡Registro actualizado correctamente!");
            navigate(`/patient/${formData.id_paciente}/records`);
        } catch (error) {
            console.error("Error al actualizar el registro:", error);

            // Mostrar el mensaje específico del backend si está disponible
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Error al actualizar el registro.");
            }
        }
    }; // Aquí cerramos correctamente la función handleSubmit

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-5">
            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-blue-500 mb-6">
                <span className="text-4xl" style={{filter: 'brightness(0) saturate(100%) invert(31%) sepia(81%) saturate(743%) hue-rotate(190deg) brightness(102%) contrast(101%)',}}>
                    🩺
                </span>
                <span>Editar Registro de Paciente</span>
            </h1>

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-lg grid gap-4"
            >
                {/* Fecha y Hora */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Fecha Dato:</label>
                        <input
                            type="date"
                            name="record_date"
                            value={formData.record_date}
                            onChange={handleInputChange}
                            max={currentDate}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Hora Dato:</label>
                        <input
                            type="time"
                            name="record_time"
                            value={formData.record_time}
                            onChange={handleInputChange}
                            max={currentTime}
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* Peso, Talla, Temperatura */}
                <div className="grid grid-cols-3 gap-4">
                    {ageGroup !== "Adulto" ? (
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Peso Pediátrico (g/kg):</label>
                            <input
                                type="number"
                                name="peso_pediatrico"
                                value={formData.peso_pediatrico || ""}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    ) : (
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Peso Adulto (kg):</label>
                            <input
                                type="number"
                                name="peso_adulto"
                                value={formData.peso_adulto || ""}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                            />
                        </div>
                    )}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Talla (cm):</label>
                        <input
                            type="number"
                            name="talla"
                            value={formData.talla}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Temperatura (°C):</label>
                        <input
                            type="number"
                            name="temperatura"
                            value={formData.temperatura}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* Presiones */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Presión Sistólica:</label>
                        <input
                            type="number"
                            name="presion_sistolica"
                            value={formData.presion_sistolica}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Presión Diastólica:</label>
                        <input
                            type="number"
                            name="presion_diastolica"
                            value={formData.presion_diastolica}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Presión Media:</label>
                        <input
                            type="number"
                            name="presion_media"
                            value={formData.presion_media}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                        />
                    </div>
                </div>

                {/* Otros datos */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Pulso (lat/min):</label>
                        <input
                            type="number"
                            name="pulso"
                            value={formData.pulso}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Frecuencia Respiratoria (resp/min):</label>
                        <input
                            type="number"
                            name="frecuencia_respiratoria"
                            value={formData.frecuencia_respiratoria}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">SatO2 (%):</label>
                        <input
                            type="number"
                            name="saturacion_oxigeno"
                            value={formData.saturacion_oxigeno}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>

                {/* Observaciones */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Observaciones:</label>
                    <textarea
                        name="observaciones"
                        value={formData.observaciones}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    ></textarea>
                </div>

                <div className="flex justify-center gap-4 mt-2">
                    <button
                        type="submit"
                        className="flex items-center px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 shadow-md transition"
                    >
                        <FiSave className="mr-2" />
                        Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPatientDataForm;