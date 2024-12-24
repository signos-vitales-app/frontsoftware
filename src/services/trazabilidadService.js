import axios from 'axios';

const API_URL = "http://localhost:5000/api";

// Función para obtener todos los logs de trazabilidad
export const getAllTrazabilidad = async () => {
  try {
    const response = await axios.get(`${API_URL}/traceability`); // Usa ${API_URL} + el endpoint
    console.log('Datos obtenidos de la API:', response.data);

    if (Array.isArray(response.data.records) && response.data.records.length > 0) {
      return response.data.records;
    } else {
      console.warn('La respuesta de la API no contiene registros válidos');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener trazabilidad:', error);
    return [];
  }
};

// Función para obtener trazabilidad por ID
export const getTrazabilidadById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/traceability/${id}`);
    console.log('Datos de trazabilidad:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener trazabilidad:', error);
    throw error;
  }
};

// Función para obtener trazabilidad específica de un paciente
export const getTrazabilidadByPatientId = async (patientId) => {
  try {
    const response = await axios.get(`${API_URL}/patients/${patientId}/traceability`);
    console.log(`Trazabilidad del paciente ${patientId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener trazabilidad del paciente ${patientId}:`, error);
    throw error;
  }
};

// Función para obtener todos los registros de trazabilidad
export const fetchTrazabilidad = async () => {
  try {
    const response = await axios.get(`${API_URL}/traceability`);
    return response.data.records || [];
  } catch (error) {
    console.error("Error al obtener registros de trazabilidad:", error);
    throw error;
  }
};