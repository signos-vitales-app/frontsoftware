import axios from 'axios';

const API_URL = "https://backsoftware.onrender.com/api";

// Función de inicio de sesión
export const login = async (numero_identificacion, password) => {
    return await axios.post(`${API_URL}/auth/login`, { numero_identificacion, password });
};

// Función de registro de usuario
export const register = async (formData) => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Función para solicitar restablecimiento de contraseña
export const resetPassword = async (email) => {
    return await axios.post(`${API_URL}/auth/reset-password`, { email });
};

// Función para actualizar la contraseña usando el token
export const updatePassword = async (token, newPassword) => {
    return await axios.patch(`${API_URL}/auth/reset-password/${token}`, { newPassword });
};

// Función para obtener la lista de usuarios (usada en el panel de administración)
export const getUsers = async () => {
    return await axios.get(`${API_URL}/users`);
};

// Función para habilitar/inhibir un usuario
export const toggleUserStatus = async (id, isActive) => {
    return await axios.patch(`${API_URL}/users/${id}/status`, { is_active: isActive });
};

// Función para obtener la información del usuario (token)
export const getUserInfo = async () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error("Token no encontrado");
    return await axios.get(`${API_URL}/auth/user-info`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};

// Eliminar un usuario
export const deleteUser = async (id) => {
    return await axios.delete(`${API_URL}/users/${id}`);
};

// Function to fetch user details by ID
export const fetchUserInfo = async (idUsuario) => {
    try {
        const response = await axios.get(`${API_URL}/users/${idUsuario}`);
        return response; // Return entire response object
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        throw error;
    }
};

// Function to update user details
export const updateUser = async (idUsuario, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/users/${idUsuario}`, updatedData);
        console.log("Respuesta de la API:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error en updateUser:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Error al actualizar usuario");
    }
};


// Función para actualizar la foto de perfil
export const updateProfileImage = async (formData) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token no encontrado");

        const response = await axios.patch(`${API_URL}/auth/update-profile-image`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error al actualizar la foto de perfil:", error);
        throw error;
    }
};