import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUserPlus, FaHandSparkles, FaUserNurse } from "react-icons/fa";
import { motion } from "framer-motion";
import 'react-toastify/dist/ReactToastify.css';
import { getUserInfo } from '../services/authService';

const Dashboard = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState(localStorage.getItem("username") || "Usuario");

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await getUserInfo();
                setUsername(response.data.username); // Actualiza el estado con el nombre de usuario
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">

            {/* Título con icono de bienvenida */}
            <motion.h1
                className="text-5xl font-bold mb-6 flex items-center gap-4"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
            >
                <span className="text-blue-600">¡Hola, {username}!</span>
                <motion.div
                    className="ml-auto"
                    animate={{ y: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <FaHandSparkles className="text-5xl text-blue-500" />
                </motion.div>
            </motion.h1>

            {/* Título de bienvenida con gradiente */}
            <motion.h2
                className="text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 mb-4"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                ¡Bienvenido a tu panel principal!
            </motion.h2>

            {/* Cuadro con el mensaje */}
            <motion.div
                className="bg-blue-50 p-6 rounded-lg shadow-2xl mb-8 text-center max-w-3xl mx-auto border-2 border-blue-300"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                style={{ width: '70%' }} // Ajuste de ancho
            >
                <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <FaUserNurse className="inline-block text-blue-600 text-4xl mb-4 transition-transform transform hover:scale-110" />
                </motion.div>
                <p className="text-lg text-gray-700">
                    Aquí puedes gestionar los datos de los pacientes que se te han asignado.
                </p>
            </motion.div>

            {/* Sección de botones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-4xl">
                {/* Botones de búsqueda y registro */}
                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <FaSearch className="w-20 h-20 text-blue-500 mb-6 transition-transform transform hover:scale-110" />
                    <button
                        onClick={() => navigate("/search-patient")}
                        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Buscar paciente
                    </button>
                </motion.div>

                <motion.div
                    className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg hover:shadow-2xl transition transform hover:scale-105"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <FaUserPlus className="w-20 h-20 text-green-500 mb-6 transition-transform transform hover:scale-110" />
                    <button
                        onClick={() => navigate("/register-patient")}
                        className="px-8 py-4 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                    >
                        Registrar paciente
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
