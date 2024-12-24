import axios from 'axios';

// URL base
const API_URL = "http://localhost:5000/api";

// Registrar un paciente
export const registerPatient = async (patientData, token) => {
    return await axios.post(
        `${API_URL}/patients`,
        patientData,
        {
            headers: {
                Authorization: `Bearer ${token}`, // Envía el token en el encabezado
            },
        }
    );
};

// Obtener la lista de pacientes
export const fetchPatients = async () => {
    return await axios.get(`${API_URL}/patients`);
};

// Obtener la información de un paciente por ID
export const fetchPatientInfo = async (idPaciente) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token no encontrado");
    return await axios.get(`${API_URL}/patients/${idPaciente}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Actualizar estado de un paciente
export const updatePatientStatus = async (idPaciente, status) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token no encontrado");
    return await axios.patch(`${API_URL}/patients/${idPaciente}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Crear un registro de signos vitales
export const createPatientRecord = async (recordData, token) => {
    if (!token) throw new Error("Token no encontrado");
    return await axios.post(`${API_URL}/patient-records/records`, recordData, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Función para obtener el historial de un paciente específico
export const fetchPatientRecords = async (idPaciente) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token no encontrado");
    return await axios.get(`${API_URL}/patient-records/records/${idPaciente}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Función para editar paciente
export const updatePatient = async (idPaciente, updatedData, token) => {
    return await axios.put(
        `${API_URL}/patients/${idPaciente}`,
        updatedData,
        {
            headers: {
                Authorization: `Bearer ${token}`, // Envía el token en el encabezado
            },
        }
    );
};

// Obtener el historial de cambios de un paciente
export const fetchPatientHistory = async (idPaciente, token) => {
    try {
        const response = await axios.get(
            `${API_URL}/patient-records/history/${idPaciente}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Respuesta del historial del paciente:", response.data); // Verifica que los datos llegan
        return response;
    } catch (error) {
        console.error("Error al obtener el historial del paciente:", error);
        throw error;
    }
};

// Obtener un registro de signos vitales específico
export const fetchPatientRecord = async (idRegistro, token) => {
    try {
        if (!token) {
            throw new Error("Token no proporcionado"); // Asegúrate de que el token esté disponible
        }

        console.log("Token enviado:", token); // Debug para asegurarte de que el token se pasa correctamente

        const response = await axios.get(
            `${API_URL}/patient-records/record/${idRegistro}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en el header
                },
            }
        );

        console.log("Datos obtenidos del registro:", response.data); // Debug para ver la respuesta
        return response.data; // Devuelve los datos
    } catch (error) {
        // Manejo detallado del error
        if (error.response) {
            // Error relacionado con la respuesta del servidor (status >= 400)
            console.error("Error en la respuesta del servidor:", error.response.data);
            console.error("Código de estado:", error.response.status);
        } else if (error.request) {
            // Error relacionado con la solicitud (sin respuesta del servidor)
            console.error("No se recibió respuesta del servidor:", error.request);
        } else {
            // Error al configurar la solicitud
            console.error("Error al configurar la solicitud:", error.message);
        }
        throw error; // Vuelve a lanzar el error para que sea manejado por el componente
    }
};

// Actualizar un registro de paciente
export const updatePatientRecord = async (idRegistro, updatedData, token) => {
    try {
        const response = await axios.put(
            `${API_URL}/patient-records/record/${idRegistro}`, // URL corregida
            updatedData,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Incluye el token en los headers
                },
            }
        );
        return response.data; // Devuelve los datos
    } catch (error) {
        console.error("Error al actualizar el registro del paciente:", error.message);
        throw error;
    }
};

// Obtener el historial de signos vitales de un paciente
export const fetchPatientHistoryRecords = async (idPaciente) => {
    try {
        const response = await axios.get(`${API_URL}/patient-records/patient-history/${idPaciente}`);
        return response.data; // Devuelve los datos históricos
    } catch (error) {
        console.error("Error al obtener el historial del paciente:", error);
        throw error;
    }
};

// Descargar PDF
export const logPdfDownload = async (idPaciente) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token no encontrado");
    return await axios.get(`${API_URL}/patients/${idPaciente}/download`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};

// Obtener trazabilidad de un paciente
export const fetchPatientTraceability = async (idPaciente) => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token no encontrado");
    return await axios.get(`${API_URL}/patients/${idPaciente}/traceability`, {
        headers: { Authorization: `Bearer ${token}` },
    });
};