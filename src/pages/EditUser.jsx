import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { updateUser, fetchUserInfo } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiHome } from "react-icons/fi";
import { FaSave, FaUserEdit } from "react-icons/fa";

const EditUser = () => {
    const { idUsuario } = useParams();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("user");
    const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
    const [loading, setLoading] = useState(true);

    // Cargar datos del usuario al iniciar
    useEffect(() => {
        const loadUserData = async () => {
            if (!idUsuario) {
                toast.error("ID de usuario no proporcionado");
                return;
            }
            try {
                const response = await fetchUserInfo(idUsuario);
                const user = response.data;
                setUsername(user.username || "");
                setEmail(user.email || "");
                setRole(user.role || "user");
                setNumeroIdentificacion(user.numero_identificacion || "");
                setLoading(false);
            } catch (error) {
                toast.error("Error al cargar los datos del usuario");
                setLoading(false);
            }
        };
        loadUserData();
    }, [idUsuario]);

    // Actualizar usuario
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!username || !email || !numeroIdentificacion) {
            toast.error("Por favor, complete todos los campos.");
            return;
        }
        try {
            const userData = {
                username,
                email,
                role,
                numero_identificacion: numeroIdentificacion,
            };
            await updateUser(idUsuario, userData);
            toast.success(`Usuario "${username}" actualizado correctamente.`);
            setTimeout(() => navigate("/search-user"), 3000);
        } catch (error) {
            toast.error("Error al actualizar el usuario");
        }
    };

    // Navegar hacia atrás
    const handleGoBack = () => {
        navigate("/search-user");
    };

    // Mostrar carga mientras se obtienen datos
    if (loading) return <div>Cargando...</div>;

    // Renderizar formulario
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <ToastContainer />
            <form
                onSubmit={handleUpdate}
                className="w-full max-w-lg p-10 bg-white rounded-lg shadow-2xl"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-blue-700 flex items-center justify-center gap-2">
                    <FaUserEdit size={35} /> Editar Usuario
                </h2>
                <div className="grid grid-cols-1 gap-6 mb-6">
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    >
                        <option value="user">Enfermero/a</option>
                        <option value="jefe">Jefe de enfermería</option>
                        <option value="staff">Médico/a</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Número de identificación"
                        value={numeroIdentificacion}
                        onChange={(e) => setNumeroIdentificacion(e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                    />
                </div>
                <div className="flex justify-center gap-6 mt-4">
                    <button
                        type="button"
                        onClick={handleGoBack}
                        className="flex items-center px-6 py-3 bg-blue-500 text-white font-bold rounded-full shadow-md hover:bg-blue-600 transition"
                    >
                        <FiHome size={20} className="mr-2" /> Regresar
                    </button>
                    <button
                        type="submit"
                        className="flex items-center px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-md hover:bg-green-600 transition"
                    >
                        <FaSave size={18} className="mr-2" /> Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditUser;